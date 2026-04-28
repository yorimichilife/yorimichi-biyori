import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { AuthUser } from "@/lib/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";

type UserRow = {
  id: string;
  name: string;
  email: string | null;
  avatar: string;
  password_hash: string | null;
  auth_provider: string;
  provider_account_id: string | null;
  created_at: string;
  updated_at: string;
};

declare global {
  var __yorimichiAuthDb: Database.Database | undefined;
}

function getLocalDb() {
  if (!global.__yorimichiAuthDb) {
    const dataDir = path.join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });
    const db = new Database(path.join(dataDir, "yorimichi.db"));
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        avatar TEXT NOT NULL,
        password_hash TEXT,
        created_at TEXT NOT NULL
      );
    `);
    const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((column) => column.name));
    if (!columnNames.has("auth_provider")) {
      db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'credentials'");
    }
    if (!columnNames.has("provider_account_id")) {
      db.exec("ALTER TABLE users ADD COLUMN provider_account_id TEXT");
    }
    if (!columnNames.has("updated_at")) {
      db.exec("ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT ''");
    }
    db.prepare("UPDATE users SET updated_at = created_at WHERE updated_at = '' OR updated_at IS NULL").run();
    db.prepare("UPDATE users SET auth_provider = 'credentials' WHERE auth_provider IS NULL OR auth_provider = ''").run();
    db.prepare("UPDATE users SET provider_account_id = email WHERE provider_account_id IS NULL AND email IS NOT NULL").run();
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_account
      ON users (auth_provider, provider_account_id);
    `);
    global.__yorimichiAuthDb = db;
  }
  return global.__yorimichiAuthDb;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, originalHash] = stored.split(":");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(derived, "hex"));
}

function mapUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    avatar: row.avatar
  };
}

function defaultAvatar() {
  return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";
}

async function getSupabaseUserById(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapUser(data as UserRow);
}

export async function getUserById(id: string) {
  if (isSupabaseConfigured()) {
    return getSupabaseUserById(id);
  }
  const row = getLocalDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export async function registerUser({
  name,
  email,
  password
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = email.toLowerCase();
  const now = new Date().toISOString();
  const user: UserRow = {
    id: randomUUID(),
    name,
    email: normalizedEmail,
    avatar: defaultAvatar(),
    password_hash: hashPassword(password),
    auth_provider: "credentials",
    provider_account_id: normalizedEmail,
    created_at: now,
    updated_at: now
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data: existing } = await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
    if (existing) {
      throw new Error("そのメールアドレスは既に登録されています。");
    }
    const { error } = await supabase.from("users").insert(user);
    if (error) {
      throw new Error("新規登録に失敗しました。");
    }
    return mapUser(user);
  }

  const db = getLocalDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    throw new Error("そのメールアドレスは既に登録されています。");
  }
  db.prepare(
    `INSERT INTO users (
      id, name, email, avatar, password_hash, auth_provider, provider_account_id, created_at, updated_at
    ) VALUES (
      @id, @name, @email, @avatar, @password_hash, @auth_provider, @provider_account_id, @created_at, @updated_at
    )`
  ).run(user);
  return mapUser(user);
}

export async function loginUser({
  email,
  password
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = email.toLowerCase();
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data } = await supabase.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
    const row = data as UserRow | null;
    if (!row?.password_hash || !verifyPassword(password, row.password_hash)) {
      throw new Error("メールアドレスまたはパスワードが正しくありません。");
    }
    return mapUser(row);
  }

  const row = getLocalDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalizedEmail) as UserRow | undefined;
  if (!row?.password_hash || !verifyPassword(password, row.password_hash)) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }
  return mapUser(row);
}

export async function upsertOAuthUser({
  provider,
  providerAccountId,
  name,
  email,
  avatar
}: {
  provider: string;
  providerAccountId: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
}) {
  const normalizedEmail = email?.toLowerCase() ?? null;
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data: providerMatch } = await supabase
      .from("users")
      .select("*")
      .eq("auth_provider", provider)
      .eq("provider_account_id", providerAccountId)
      .maybeSingle();
    if (providerMatch) {
      await supabase
        .from("users")
        .update({
          name: name || providerMatch.name,
          email: normalizedEmail ?? providerMatch.email,
          avatar: avatar || providerMatch.avatar,
          updated_at: now
        })
        .eq("id", providerMatch.id);
      return (await getSupabaseUserById(providerMatch.id))!;
    }
    if (normalizedEmail) {
      const { data: emailMatch } = await supabase.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
      if (emailMatch) {
        await supabase
          .from("users")
          .update({
            name: name || emailMatch.name,
            avatar: avatar || emailMatch.avatar,
            auth_provider: provider,
            provider_account_id: providerAccountId,
            updated_at: now
          })
          .eq("id", emailMatch.id);
        return (await getSupabaseUserById(emailMatch.id))!;
      }
    }
    const user: UserRow = {
      id: randomUUID(),
      name: name || "旅人",
      email: normalizedEmail,
      avatar: avatar || defaultAvatar(),
      password_hash: null,
      auth_provider: provider,
      provider_account_id: providerAccountId,
      created_at: now,
      updated_at: now
    };
    const { error } = await supabase.from("users").insert(user);
    if (error) {
      throw new Error("OAuth ユーザーの保存に失敗しました。");
    }
    return mapUser(user);
  }

  const db = getLocalDb();
  const providerMatch = db
    .prepare("SELECT * FROM users WHERE auth_provider = ? AND provider_account_id = ?")
    .get(provider, providerAccountId) as UserRow | undefined;

  if (providerMatch) {
    db.prepare("UPDATE users SET name = ?, email = COALESCE(?, email), avatar = ?, updated_at = ? WHERE id = ?").run(
      name || providerMatch.name,
      normalizedEmail,
      avatar || providerMatch.avatar,
      now,
      providerMatch.id
    );
    return (await getUserById(providerMatch.id))!;
  }

  if (normalizedEmail) {
    const emailMatch = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as UserRow | undefined;
    if (emailMatch) {
      db.prepare(
        `UPDATE users
         SET name = ?, avatar = ?, auth_provider = ?, provider_account_id = ?, updated_at = ?
         WHERE id = ?`
      ).run(name || emailMatch.name, avatar || emailMatch.avatar, provider, providerAccountId, now, emailMatch.id);
      return (await getUserById(emailMatch.id))!;
    }
  }

  const user: UserRow = {
    id: randomUUID(),
    name: name || "旅人",
    email: normalizedEmail,
    avatar: avatar || defaultAvatar(),
    password_hash: null,
    auth_provider: provider,
    provider_account_id: providerAccountId,
    created_at: now,
    updated_at: now
  };

  db.prepare(
    `INSERT INTO users (
      id, name, email, avatar, password_hash, auth_provider, provider_account_id, created_at, updated_at
    ) VALUES (
      @id, @name, @email, @avatar, @password_hash, @auth_provider, @provider_account_id, @created_at, @updated_at
    )`
  ).run(user);

  return mapUser(user);
}

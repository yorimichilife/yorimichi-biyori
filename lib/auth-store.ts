import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { AuthUser, FollowedAuthor } from "@/lib/types";
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

type FollowRow = {
  follower_id: string;
  following_id: string;
  created_at: string;
  user?: UserRow;
};

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
    db.exec(`
      CREATE TABLE IF NOT EXISTS followings (
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (follower_id, following_id)
      );
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_followings_follower
      ON followings (follower_id);
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

function describeSupabaseAuthError(error: { message?: string; code?: string } | null | undefined, fallback: string) {
  const raw = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  if (raw.includes("relation") || raw.includes("does not exist") || raw.includes("users")) {
    return "Supabase の users テーブルが未作成です。`scripts/supabase-schema.sql` を SQL Editor で実行してください。";
  }
  if (raw.includes("permission") || raw.includes("denied") || raw.includes("row-level security")) {
    return "Supabase の権限設定で保存できません。service_role key とテーブル設定を確認してください。";
  }
  return fallback;
}

function isMissingFollowingsTable(error: { message?: string; code?: string } | null | undefined) {
  const raw = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return raw.includes("followings") && (raw.includes("does not exist") || raw.includes("relation"));
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
    const { data: existing, error: selectError } = await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
    if (selectError) {
      throw new Error(describeSupabaseAuthError(selectError, "Supabase のユーザー確認に失敗しました。"));
    }
    if (existing) {
      throw new Error("そのメールアドレスは既に登録されています。");
    }
    const { error } = await supabase.from("users").insert(user);
    if (error) {
      throw new Error(describeSupabaseAuthError(error, "新規登録に失敗しました。"));
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
    const { data, error } = await supabase.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
    if (error) {
      throw new Error(describeSupabaseAuthError(error, "Supabase のログイン確認に失敗しました。"));
    }
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
      throw new Error(describeSupabaseAuthError(error, "OAuth ユーザーの保存に失敗しました。"));
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

function mapFollowedAuthor(row: UserRow): FollowedAuthor {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar
  };
}

export async function getFollowedUserIds(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("followings")
      .select("following_id")
      .eq("follower_id", userId);
    if (error && isMissingFollowingsTable(error)) {
      return [];
    }
    if (error) {
      throw new Error("フォロー情報の取得に失敗しました。");
    }
    return (data ?? []).map((row: { following_id: string }) => row.following_id);
  }

  const rows = getLocalDb()
    .prepare("SELECT following_id FROM followings WHERE follower_id = ?")
    .all(userId) as Array<{ following_id: string }>;
  return rows.map((row) => row.following_id);
}

export async function getFollowedAuthors(userId: string): Promise<FollowedAuthor[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const ids = await getFollowedUserIds(userId);
    if (!ids.length) return [];
    const { data, error } = await supabase.from("users").select("*").in("id", ids);
    if (error) {
      throw new Error("フォロー中ユーザーの取得に失敗しました。");
    }
    return ((data ?? []) as UserRow[]).map(mapFollowedAuthor);
  }

  const rows = getLocalDb()
    .prepare(
      `SELECT users.*
       FROM followings
       JOIN users ON users.id = followings.following_id
       WHERE followings.follower_id = ?`
    )
    .all(userId) as UserRow[];
  return rows.map(mapFollowedAuthor);
}

export async function isFollowingUser(followerId: string, followingId: string) {
  if (followerId === followingId) return false;
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("followings")
      .select("following_id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();
    if (error && isMissingFollowingsTable(error)) {
      return false;
    }
    if (error) {
      throw new Error("フォロー状態の確認に失敗しました。");
    }
    return Boolean(data);
  }

  const row = getLocalDb()
    .prepare("SELECT following_id FROM followings WHERE follower_id = ? AND following_id = ?")
    .get(followerId, followingId);
  return Boolean(row);
}

export async function toggleFollowUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("自分自身をフォローすることはできません。");
  }

  const currentlyFollowing = await isFollowingUser(followerId, followingId);
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    if (currentlyFollowing) {
      const { error } = await supabase
        .from("followings")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);
      if (error) throw new Error("フォロー解除に失敗しました。");
      return { following: false };
    }

    const { error } = await supabase.from("followings").insert({
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString()
    });
    if (error && isMissingFollowingsTable(error)) {
      throw new Error("Supabase の followings テーブルが未作成です。最新の `scripts/supabase-schema.sql` を実行してください。");
    }
    if (error) throw new Error("フォローに失敗しました。");
    return { following: true };
  }

  const db = getLocalDb();
  if (currentlyFollowing) {
    db.prepare("DELETE FROM followings WHERE follower_id = ? AND following_id = ?").run(followerId, followingId);
    return { following: false };
  }

  db.prepare("INSERT INTO followings (follower_id, following_id, created_at) VALUES (?, ?, ?)").run(
    followerId,
    followingId,
    new Date().toISOString()
  );
  return { following: true };
}

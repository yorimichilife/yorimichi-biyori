import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { AccountProfile, ExpenseCategory, ExpenseItem, Note } from "@/lib/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";
import { getAllNotes, getNoteById } from "@/lib/notes-store";
import { getUserById } from "@/lib/auth-store";

type UserProfileRow = {
  id: string;
  name: string;
  email: string | null;
  avatar: string;
  handle: string | null;
  bio: string | null;
};

type ExpenseRow = {
  id: string;
  user_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  spent_at: string;
  note_id: string | null;
  created_at: string;
};

declare global {
  var __yorimichiMyPageDb: Database.Database | undefined;
}

function getLocalDb() {
  if (!global.__yorimichiMyPageDb) {
    const dataDir = path.join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });
    const db = new Database(path.join(dataDir, "yorimichi.db"));
    db.pragma("journal_mode = WAL");

    const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const userColumnNames = new Set(userColumns.map((column) => column.name));
    if (!userColumnNames.has("handle")) {
      db.exec("ALTER TABLE users ADD COLUMN handle TEXT");
    }
    if (!userColumnNames.has("bio")) {
      db.exec("ALTER TABLE users ADD COLUMN bio TEXT");
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS expense_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        amount INTEGER NOT NULL,
        spent_at TEXT NOT NULL,
        note_id TEXT,
        created_at TEXT NOT NULL
      );
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS note_likes (
        user_id TEXT NOT NULL,
        note_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (user_id, note_id)
      );
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS note_saves (
        user_id TEXT NOT NULL,
        note_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (user_id, note_id)
      );
    `);

    global.__yorimichiMyPageDb = db;
  }
  return global.__yorimichiMyPageDb;
}

function defaultHandle(name: string, id: string) {
  const base = name
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return `@${base || "yorimichi"}_${id.slice(0, 5)}`;
}

function mapProfile(row: UserProfileRow): AccountProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    avatar: row.avatar,
    handle: row.handle || defaultHandle(row.name, row.id),
    bio: row.bio || "ふらっと見つけた景色や気持ちを、よりみち日記に残しています。"
  };
}

function mapExpense(row: ExpenseRow): ExpenseItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    amount: row.amount,
    spentAt: row.spent_at,
    noteId: row.note_id,
    createdAt: row.created_at
  };
}

function isMissingSchema(error: { message?: string; code?: string } | null | undefined, keyword: string) {
  const raw = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return raw.includes(keyword.toLowerCase()) && (raw.includes("does not exist") || raw.includes("relation") || raw.includes("column"));
}

export async function getAccountProfile(userId: string): Promise<AccountProfile | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("users").select("id, name, email, avatar, handle, bio").eq("id", userId).maybeSingle();
    if (error && isMissingSchema(error, "handle")) {
      const fallbackUser = await getUserById(userId);
      return fallbackUser
        ? {
            ...fallbackUser,
            handle: defaultHandle(fallbackUser.name, fallbackUser.id),
            bio: "ふらっと見つけた景色や気持ちを、よりみち日記に残しています。"
          }
        : null;
    }
    return data ? mapProfile(data as UserProfileRow) : null;
  }

  const row = getLocalDb()
    .prepare("SELECT id, name, email, avatar, handle, bio FROM users WHERE id = ?")
    .get(userId) as UserProfileRow | undefined;
  return row ? mapProfile(row) : null;
}

export async function updateAccountProfile(
  userId: string,
  payload: { name: string; handle: string; bio: string; avatar: string }
): Promise<AccountProfile | null> {
  const next = {
    name: payload.name.trim() || "旅人",
    handle: payload.handle.trim().startsWith("@") ? payload.handle.trim() : `@${payload.handle.trim()}`,
    bio: payload.bio.trim(),
    avatar: payload.avatar.trim()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase
      .from("users")
      .update({
        name: next.name,
        handle: next.handle,
        bio: next.bio,
        avatar: next.avatar,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
    if (error && isMissingSchema(error, "handle")) {
      throw new Error("Supabase の users テーブルにプロフィール列がありません。最新の `scripts/supabase-schema.sql` を再実行してください。");
    }
    if (error) throw new Error("アカウント設定の保存に失敗しました。");
    return getAccountProfile(userId);
  }

  getLocalDb()
    .prepare("UPDATE users SET name = ?, handle = ?, bio = ?, avatar = ?, updated_at = ? WHERE id = ?")
    .run(next.name, next.handle, next.bio, next.avatar, new Date().toISOString(), userId);
  return getAccountProfile(userId);
}

export async function getReactionState(noteId: string, userId: string, field: "likes" | "saves") {
  const table = field === "likes" ? "note_likes" : "note_saves";
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from(table).select("note_id").eq("user_id", userId).eq("note_id", noteId).maybeSingle();
    if (error && isMissingSchema(error, table)) return false;
    return Boolean(data);
  }
  const row = getLocalDb()
    .prepare(`SELECT note_id FROM ${table} WHERE user_id = ? AND note_id = ?`)
    .get(userId, noteId);
  return Boolean(row);
}

export async function toggleReaction(
  noteId: string,
  userId: string,
  field: "likes" | "saves"
): Promise<{ field: "likes" | "saves"; value: number; active: boolean } | null> {
  const note = await getNoteById(noteId);
  if (!note) return null;
  const table = field === "likes" ? "note_likes" : "note_saves";
  const active = await getReactionState(noteId, userId, field);
  const nextActive = !active;
  const nextValue = Math.max(0, note[field] + (nextActive ? 1 : -1));
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    if (nextActive) {
      const { error } = await supabase.from(table).insert({ user_id: userId, note_id: noteId, created_at: now });
      if (error && isMissingSchema(error, table)) {
        throw new Error("Supabase のリアクション用テーブルが未作成です。最新の `scripts/supabase-schema.sql` を実行してください。");
      }
      if (error) throw new Error("リアクションの保存に失敗しました。");
    } else {
      const { error } = await supabase.from(table).delete().eq("user_id", userId).eq("note_id", noteId);
      if (error && isMissingSchema(error, table)) {
        throw new Error("Supabase のリアクション用テーブルが未作成です。最新の `scripts/supabase-schema.sql` を実行してください。");
      }
      if (error) throw new Error("リアクションの更新に失敗しました。");
    }
    const { error } = await supabase.from("notes").update({ [field]: nextValue, updated_at: now }).eq("id", noteId);
    if (error) throw new Error("リアクション数の更新に失敗しました。");
    return { field, value: nextValue, active: nextActive };
  }

  const db = getLocalDb();
  if (nextActive) {
    db.prepare(`INSERT OR REPLACE INTO ${table} (user_id, note_id, created_at) VALUES (?, ?, ?)`).run(userId, noteId, now);
  } else {
    db.prepare(`DELETE FROM ${table} WHERE user_id = ? AND note_id = ?`).run(userId, noteId);
  }
  db.prepare(`UPDATE notes SET ${field} = ?, updated_at = ? WHERE id = ?`).run(nextValue, now, noteId);
  return { field, value: nextValue, active: nextActive };
}

export async function getLikedNoteIds(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("note_likes").select("note_id").eq("user_id", userId).order("created_at", { ascending: false });
    if (error && isMissingSchema(error, "note_likes")) return [];
    return (data ?? []).map((row: { note_id: string }) => row.note_id);
  }

  const rows = getLocalDb()
    .prepare("SELECT note_id FROM note_likes WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Array<{ note_id: string }>;
  return rows.map((row) => row.note_id);
}

export async function getLikedNotesByUser(userId: string): Promise<Note[]> {
  const likedIds = await getLikedNoteIds(userId);
  if (!likedIds.length) return [];
  const notes = await getAllNotes();
  const rank = new Map<string, number>(likedIds.map((id: string, index: number) => [id, index]));
  return notes
    .filter((note) => rank.has(note.id))
    .sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999));
}

export async function addExpenseItem(
  userId: string,
  payload: { title: string; category: ExpenseCategory; amount: number; spentAt: string; noteId?: string | null }
) {
  const item: ExpenseItem = {
    id: randomUUID().slice(0, 10),
    userId,
    title: payload.title.trim(),
    category: payload.category,
    amount: payload.amount,
    spentAt: payload.spentAt,
    noteId: payload.noteId ?? null,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from("expense_items").insert({
      id: item.id,
      user_id: item.userId,
      title: item.title,
      category: item.category,
      amount: item.amount,
      spent_at: item.spentAt,
      note_id: item.noteId,
      created_at: item.createdAt
    });
    if (error && isMissingSchema(error, "expense_items")) {
      throw new Error("Supabase の expense_items テーブルが未作成です。最新の `scripts/supabase-schema.sql` を実行してください。");
    }
    if (error) throw new Error("家計簿の保存に失敗しました。");
    return item;
  }

  getLocalDb()
    .prepare(
      "INSERT INTO expense_items (id, user_id, title, category, amount, spent_at, note_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(item.id, item.userId, item.title, item.category, item.amount, item.spentAt, item.noteId, item.createdAt);
  return item;
}

export async function getExpenseItemsByMonth(userId: string, month: string): Promise<ExpenseItem[]> {
  const start = `${month}-01`;
  const next = new Date(`${start}T00:00:00+09:00`);
  next.setMonth(next.getMonth() + 1);
  const end = next.toISOString().slice(0, 10);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("expense_items")
      .select("*")
      .eq("user_id", userId)
      .gte("spent_at", start)
      .lt("spent_at", end)
      .order("spent_at", { ascending: false });
    if (error && isMissingSchema(error, "expense_items")) return [];
    return ((data ?? []) as ExpenseRow[]).map(mapExpense);
  }

  const rows = getLocalDb()
    .prepare(
      "SELECT * FROM expense_items WHERE user_id = ? AND spent_at >= ? AND spent_at < ? ORDER BY spent_at DESC, created_at DESC"
    )
    .all(userId, start, end) as ExpenseRow[];
  return rows.map(mapExpense);
}

export async function getAllTimeExpenseTotal(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("expense_items").select("amount").eq("user_id", userId);
    if (error && isMissingSchema(error, "expense_items")) return 0;
    return (data ?? []).reduce((sum: number, row: { amount: number }) => sum + Number(row.amount || 0), 0);
  }

  const rows = getLocalDb().prepare("SELECT amount FROM expense_items WHERE user_id = ?").all(userId) as Array<{ amount: number }>;
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

export async function getExpenseOverview(userId: string, month: string) {
  const items = await getExpenseItemsByMonth(userId, month);
  const totals = {
    カフェ: 0,
    旅行: 0,
    その他: 0
  } satisfies Record<ExpenseCategory, number>;

  for (const item of items) {
    totals[item.category] += item.amount;
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, total, totals };
}

export async function getMyPageSnapshot(userId: string) {
  const [profile, ownNotes, likedNotes, totalExpense] = await Promise.all([
    getAccountProfile(userId),
    getAllNotes().then((notes) => notes.filter((note) => note.userId === userId)),
    getLikedNotesByUser(userId),
    getAllTimeExpenseTotal(userId)
  ]);

  const uniqueSpots = new Set(ownNotes.flatMap((note) => note.spots));
  return {
    profile,
    ownNotes,
    likedNotes,
    totalExpense,
    visitedSpotCount: uniqueSpots.size
  };
}

export async function getFreshSessionUser(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;
  const profile = await getAccountProfile(userId);
  return {
    ...user,
    name: profile?.name ?? user.name,
    avatar: profile?.avatar ?? user.avatar
  };
}

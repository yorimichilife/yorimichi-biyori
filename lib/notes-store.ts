import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { AuthUser, CommentItem, Note, NotePayload, Privacy } from "@/lib/types";
import { getAppUrl, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";

type NoteRow = {
  id: string;
  slug: string;
  user_id: string | null;
  title: string;
  area: string;
  prefecture: string;
  start_date: string;
  end_date: string;
  date_range: string;
  duration: string;
  style: string | string[];
  companions: string;
  theme: string | string[];
  summary: string;
  cover_image: string;
  status: Privacy;
  likes: number;
  comments: number;
  saves: number;
  author_name: string;
  author_avatar: string;
  days: string | Note["days"];
  comment_items?: string | CommentItem[];
  spots: string | string[];
  tags: string | string[];
  share_url: string;
  share_password: string;
  allow_comments: number | boolean;
  allow_download: number | boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

const legacySeedIds = ["kyoto-nara", "okinawa", "kanazawa", "kusatsu", "kamikochi", "kamakura", "kumamoto"];

declare global {
  var __yorimichiDb: Database.Database | undefined;
}

function getLocalDb() {
  if (!global.__yorimichiDb) {
    const dataDir = path.join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });
    const db = new Database(path.join(dataDir, "yorimichi.db"));
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        user_id TEXT,
        title TEXT NOT NULL,
        area TEXT NOT NULL,
        prefecture TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        date_range TEXT NOT NULL,
        duration TEXT NOT NULL,
        style TEXT NOT NULL,
        companions TEXT NOT NULL,
        theme TEXT NOT NULL,
        summary TEXT NOT NULL,
        cover_image TEXT NOT NULL,
        status TEXT NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        comments INTEGER NOT NULL DEFAULT 0,
        saves INTEGER NOT NULL DEFAULT 0,
        author_name TEXT NOT NULL,
        author_avatar TEXT NOT NULL,
        days TEXT NOT NULL,
        comment_items TEXT NOT NULL DEFAULT '[]',
        spots TEXT NOT NULL,
        tags TEXT NOT NULL,
        share_url TEXT NOT NULL,
        share_password TEXT NOT NULL DEFAULT '',
        allow_comments INTEGER NOT NULL DEFAULT 1,
        allow_download INTEGER NOT NULL DEFAULT 1,
        expires_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    try {
      db.exec("ALTER TABLE notes ADD COLUMN user_id TEXT");
    } catch {}
    try {
      db.exec("ALTER TABLE notes ADD COLUMN comment_items TEXT NOT NULL DEFAULT '[]'");
    } catch {}
    const placeholders = legacySeedIds.map(() => "?").join(", ");
    db.prepare(`DELETE FROM notes WHERE user_id IS NULL AND id IN (${placeholders})`).run(...legacySeedIds);
    global.__yorimichiDb = db;
  }
  return global.__yorimichiDb;
}

function parseJson<T>(value: T | string | null | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toRow(note: Note) {
  return {
    id: note.id,
    slug: note.slug,
    user_id: note.userId ?? null,
    title: note.title,
    area: note.area,
    prefecture: note.prefecture,
    start_date: note.startDate,
    end_date: note.endDate,
    date_range: note.dateRange,
    duration: note.duration,
    style: JSON.stringify(note.style),
    companions: note.companions,
    theme: JSON.stringify(note.theme),
    summary: note.summary,
    cover_image: note.coverImage,
    status: note.status,
    likes: note.likes,
    comments: note.comments,
    saves: note.saves,
    author_name: note.author.name,
    author_avatar: note.author.avatar,
    days: JSON.stringify(note.days),
    comment_items: JSON.stringify(note.commentItems ?? []),
    spots: JSON.stringify(note.spots),
    tags: JSON.stringify(note.tags),
    share_url: note.share.shareUrl,
    share_password: note.share.password,
    allow_comments: note.share.allowComments ? 1 : 0,
    allow_download: note.share.allowDownload ? 1 : 0,
    expires_at: note.share.expiresAt,
    created_at: note.createdAt,
    updated_at: note.updatedAt
  };
}

function fromRow(row: NoteRow): Note {
  return {
    id: row.id,
    slug: row.slug,
    userId: row.user_id,
    title: row.title,
    area: row.area,
    prefecture: row.prefecture,
    startDate: row.start_date,
    endDate: row.end_date,
    dateRange: row.date_range,
    duration: row.duration,
    style: parseJson<string[]>(row.style, []),
    companions: row.companions,
    theme: parseJson<string[]>(row.theme, []),
    summary: row.summary,
    coverImage: row.cover_image,
    status: row.status,
    likes: row.likes,
    comments: row.comments,
    saves: row.saves,
    author: { name: row.author_name, avatar: row.author_avatar },
    days: parseJson<Note["days"]>(row.days, []),
    commentItems: parseJson<CommentItem[]>(row.comment_items, []),
    spots: parseJson<string[]>(row.spots, []),
    tags: parseJson<string[]>(row.tags, []),
    share: {
      shareUrl: row.share_url,
      password: row.share_password,
      allowComments: Boolean(row.allow_comments),
      allowDownload: Boolean(row.allow_download),
      expiresAt: row.expires_at
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function dateLabel(value: string) {
  return value.replaceAll("-", "/");
}

function buildDateRange(startDate: string, endDate: string) {
  return startDate === endDate ? dateLabel(startDate) : `${dateLabel(startDate)} 〜 ${dateLabel(endDate)}`;
}

function buildDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff <= 0 ? "日帰り" : `${diff}泊${diff + 1}日`;
}

function createSlug(title: string) {
  const base = title.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-+|-+$/g, "");
  return base || `note-${Date.now()}`;
}

function buildTags(area: string, prefecture: string, style: string[], theme: string[]) {
  return [area, prefecture, ...style, ...theme].slice(0, 6).map((item) => `#${item}`);
}

async function getAllNotesSupabase(): Promise<Note[]> {
  const supabase = getSupabaseAdmin()!;
  const { data } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
  return ((data ?? []) as NoteRow[]).map((row: NoteRow) => fromRow(row));
}

export async function getAllNotes(): Promise<Note[]> {
  if (isSupabaseConfigured()) {
    return getAllNotesSupabase();
  }
  const rows = getLocalDb().prepare("SELECT * FROM notes ORDER BY updated_at DESC").all() as NoteRow[];
  return rows.map(fromRow);
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data } = await supabase.from("notes").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    return ((data ?? []) as NoteRow[]).map((row: NoteRow) => fromRow(row));
  }
  const rows = getLocalDb().prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC").all(userId) as NoteRow[];
  return rows.map(fromRow);
}

export async function getPublicNotes(): Promise<Note[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data } = await supabase.from("notes").select("*").eq("status", "public").order("updated_at", { ascending: false });
    return ((data ?? []) as NoteRow[]).map((row: NoteRow) => fromRow(row));
  }
  return (await getAllNotes()).filter((note) => note.status === "public");
}

export async function getFeaturedNotes(): Promise<Note[]> {
  return (await getPublicNotes()).slice(0, 3);
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
    return data ? fromRow(data as NoteRow) : null;
  }
  const row = getLocalDb().prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow | undefined;
  return row ? fromRow(row) : null;
}

export function isNoteOwner(note: Note, user?: AuthUser | null) {
  return Boolean(user?.id && note.userId && user.id === note.userId);
}

export function canViewNote(note: Note, user?: AuthUser | null) {
  if (isNoteOwner(note, user)) return true;
  return note.status === "public";
}

export async function createNote(payload: NotePayload, author: AuthUser): Promise<Note> {
  const now = new Date().toISOString();
  const id = randomUUID().slice(0, 8);
  const note: Note = {
    id,
    slug: createSlug(payload.title),
    userId: author.id,
    title: payload.title,
    area: payload.area,
    prefecture: payload.prefecture,
    startDate: payload.startDate,
    endDate: payload.endDate,
    dateRange: buildDateRange(payload.startDate, payload.endDate),
    duration: buildDuration(payload.startDate, payload.endDate),
    style: payload.style,
    companions: payload.companions,
    theme: payload.theme,
    summary: payload.summary,
    coverImage: payload.coverImage,
    status: payload.status,
    likes: 0,
    comments: 0,
    saves: 0,
    author: { name: author.name, avatar: author.avatar },
    days: payload.days,
    commentItems: [],
    spots: payload.spots,
    tags: buildTags(payload.area, payload.prefecture, payload.style, payload.theme),
    share: {
      shareUrl: `${getAppUrl()}/share/note/${id}`,
      password: "",
      allowComments: true,
      allowDownload: true,
      expiresAt: null
    },
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from("notes").insert(toRow(note));
    if (error) throw new Error("旅日記の保存に失敗しました。");
    return note;
  }

  getLocalDb()
    .prepare(`
      INSERT INTO notes (
        id, slug, user_id, title, area, prefecture, start_date, end_date, date_range, duration, style, companions, theme,
        summary, cover_image, status, likes, comments, saves, author_name, author_avatar, days, comment_items, spots, tags,
        share_url, share_password, allow_comments, allow_download, expires_at, created_at, updated_at
      ) VALUES (
        @id, @slug, @user_id, @title, @area, @prefecture, @start_date, @end_date, @date_range, @duration, @style, @companions, @theme,
        @summary, @cover_image, @status, @likes, @comments, @saves, @author_name, @author_avatar, @days, @comment_items, @spots, @tags,
        @share_url, @share_password, @allow_comments, @allow_download, @expires_at, @created_at, @updated_at
      )
    `)
    .run(toRow(note));

  return note;
}

export async function updateNote(id: string, payload: NotePayload): Promise<Note | null> {
  const existing = await getNoteById(id);
  if (!existing) return null;
  const updated: Note = {
    ...existing,
    title: payload.title,
    slug: createSlug(payload.title),
    area: payload.area,
    prefecture: payload.prefecture,
    startDate: payload.startDate,
    endDate: payload.endDate,
    dateRange: buildDateRange(payload.startDate, payload.endDate),
    duration: buildDuration(payload.startDate, payload.endDate),
    style: payload.style,
    companions: payload.companions,
    theme: payload.theme,
    summary: payload.summary,
    coverImage: payload.coverImage,
    status: payload.status,
    days: payload.days,
    spots: payload.spots,
    tags: buildTags(payload.area, payload.prefecture, payload.style, payload.theme),
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from("notes").update(toRow(updated)).eq("id", id);
    if (error) throw new Error("旅日記の更新に失敗しました。");
    return updated;
  }

  getLocalDb()
    .prepare(`
      UPDATE notes
      SET slug = @slug,
          title = @title,
          area = @area,
          prefecture = @prefecture,
          start_date = @start_date,
          end_date = @end_date,
          date_range = @date_range,
          duration = @duration,
          style = @style,
          companions = @companions,
          theme = @theme,
          summary = @summary,
          cover_image = @cover_image,
          status = @status,
          days = @days,
          spots = @spots,
          tags = @tags,
          updated_at = @updated_at
      WHERE id = @id
    `)
    .run({
      id,
      slug: updated.slug,
      title: updated.title,
      area: updated.area,
      prefecture: updated.prefecture,
      start_date: updated.startDate,
      end_date: updated.endDate,
      date_range: updated.dateRange,
      duration: updated.duration,
      style: JSON.stringify(updated.style),
      companions: updated.companions,
      theme: JSON.stringify(updated.theme),
      summary: updated.summary,
      cover_image: updated.coverImage,
      status: updated.status,
      days: JSON.stringify(updated.days),
      spots: JSON.stringify(updated.spots),
      tags: JSON.stringify(updated.tags),
      updated_at: updated.updatedAt
    });

  return updated;
}

export async function updateShareSettings(
  id: string,
  payload: {
    status: Privacy;
    password: string;
    allowComments: boolean;
    allowDownload: boolean;
    expiresAt: string | null;
  }
): Promise<Note | null> {
  const note = await getNoteById(id);
  if (!note) return null;

  const updated = {
    ...note,
    status: payload.status,
    share: {
      ...note.share,
      password: payload.password,
      allowComments: payload.allowComments,
      allowDownload: payload.allowDownload,
      expiresAt: payload.expiresAt
    },
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase
      .from("notes")
      .update({
        status: updated.status,
        share_password: updated.share.password,
        allow_comments: updated.share.allowComments,
        allow_download: updated.share.allowDownload,
        expires_at: updated.share.expiresAt,
        updated_at: updated.updatedAt
      })
      .eq("id", id);
    if (error) throw new Error("共有設定の更新に失敗しました。");
    return updated;
  }

  getLocalDb()
    .prepare(`
      UPDATE notes
      SET status = @status,
          share_password = @share_password,
          allow_comments = @allow_comments,
          allow_download = @allow_download,
          expires_at = @expires_at,
          updated_at = @updated_at
      WHERE id = @id
    `)
    .run({
      id,
      status: updated.status,
      share_password: updated.share.password,
      allow_comments: updated.share.allowComments ? 1 : 0,
      allow_download: updated.share.allowDownload ? 1 : 0,
      expires_at: updated.share.expiresAt,
      updated_at: updated.updatedAt
    });

  return updated;
}

export async function addComment(id: string, body: string, user?: AuthUser): Promise<CommentItem | null> {
  const note = await getNoteById(id);
  if (!note) return null;
  const comment: CommentItem = {
    id: randomUUID().slice(0, 8),
    name: user?.name ?? "旅人",
    avatar: user?.avatar ?? "https://images.unsplash.com/photo-1542204625-de293a2f5f7f?auto=format&fit=crop&w=200&q=80",
    body,
    createdAt: new Date().toISOString()
  };
  const commentItems = [...(note.commentItems ?? []), comment];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase
      .from("notes")
      .update({
        comment_items: commentItems,
        comments: commentItems.length,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    if (error) throw new Error("コメントの保存に失敗しました。");
    return comment;
  }

  getLocalDb()
    .prepare("UPDATE notes SET comment_items = @comment_items, comments = @comments, updated_at = @updated_at WHERE id = @id")
    .run({
      id,
      comment_items: JSON.stringify(commentItems),
      comments: commentItems.length,
      updated_at: new Date().toISOString()
    });
  return comment;
}

export async function incrementReaction(id: string, field: "likes" | "saves"): Promise<{ field: "likes" | "saves"; value: number } | null> {
  const note = await getNoteById(id);
  if (!note) return null;
  const nextValue = note[field] + 1;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from("notes").update({ [field]: nextValue, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error("リアクションの更新に失敗しました。");
    return { field, value: nextValue };
  }

  getLocalDb().prepare(`UPDATE notes SET ${field} = ?, updated_at = ? WHERE id = ?`).run(nextValue, new Date().toISOString(), id);
  return { field, value: nextValue };
}

export function canAccessSharedNote(note: Note, password?: string) {
  if (note.status === "private" || note.status === "draft") return false;
  if (note.share.expiresAt && new Date(note.share.expiresAt) < new Date()) return false;
  if (!note.share.password) return true;
  return note.share.password === (password ?? "");
}

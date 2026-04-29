import { NextResponse } from "next/server";
import { createNote, getNotesByUser, getPublicNotes } from "@/lib/notes-store";
import { NotePayload } from "@/lib/types";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ notes: user ? await getNotesByUser(user.id) : await getPublicNotes() });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "旅ノートの作成にはログインが必要です。" }, { status: 401 });
  }
  const payload = (await request.json()) as Partial<NotePayload>;
  if (!payload.title || !payload.prefecture || !payload.startDate || !payload.endDate || !payload.summary) {
    return NextResponse.json({ message: "必須項目を入力してください。" }, { status: 400 });
  }

  const note = await createNote({
    title: payload.title,
    area: payload.area || "国内",
    prefecture: payload.prefecture,
    startDate: payload.startDate,
    endDate: payload.endDate,
    summary: payload.summary,
    coverImage: payload.coverImage || "",
    companions: payload.companions || "ひとり",
    style: payload.style || ["旅"],
    theme: payload.theme || [],
    status: payload.status || "private",
    days: payload.days || [],
    spots: payload.spots || []
  }, user);

  return NextResponse.json({ note }, { status: 201 });
}

import { NextResponse } from "next/server";
import { canViewNote, getNoteById, isNoteOwner, updateNote, updateShareSettings } from "@/lib/notes-store";
import { NotePayload, Privacy } from "@/lib/types";
import { getSessionUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const note = await getNoteById(id);
  const user = await getSessionUser();

  if (!note || !canViewNote(note, user)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  const current = await getNoteById(id);
  if (!current) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  if (!user || !isNoteOwner(current, user)) {
    return NextResponse.json({ message: "この旅ノートを編集する権限がありません。" }, { status: 403 });
  }
  const body = await request.json();
  let note;
  if ("allowComments" in body || "allowDownload" in body || "password" in body) {
    note = await updateShareSettings(id, body as {
      status: Privacy;
      password: string;
      allowComments: boolean;
      allowDownload: boolean;
      expiresAt: string | null;
    });
  } else {
    note = await updateNote(id, body as NotePayload);
  }
  return NextResponse.json({ note });
}

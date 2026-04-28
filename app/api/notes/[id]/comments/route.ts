import { NextResponse } from "next/server";
import { addComment, canViewNote, getNoteById, isNoteOwner } from "@/lib/notes-store";
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
  return NextResponse.json({ comments: note.commentItems ?? [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "コメントにはログインが必要です。" }, { status: 401 });
  }
  const note = await getNoteById(id);
  if (!note) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  if (!canViewNote(note, user) && !isNoteOwner(note, user)) {
    return NextResponse.json({ message: "閲覧権限がありません。" }, { status: 403 });
  }
  if (!note.share.allowComments) {
    return NextResponse.json({ message: "このノートではコメントが無効です。" }, { status: 403 });
  }
  const body = (await request.json()) as { body?: string };
  if (!body.body?.trim()) {
    return NextResponse.json({ message: "コメントを入力してください。" }, { status: 400 });
  }
  const comment = await addComment(id, body.body.trim(), user);
  return NextResponse.json({ comment }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { toggleReaction } from "@/lib/mypage-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { field?: "likes" | "saves" };
  if (!body.field || !["likes", "saves"].includes(body.field)) {
    return NextResponse.json({ message: "invalid field" }, { status: 400 });
  }
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "いいねや保存にはログインが必要です。" }, { status: 401 });
  }
  const result = await toggleReaction(id, user.id, body.field);
  if (!result) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}

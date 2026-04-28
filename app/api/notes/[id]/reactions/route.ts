import { NextResponse } from "next/server";
import { incrementReaction } from "@/lib/notes-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { field?: "likes" | "saves" };
  if (!body.field || !["likes", "saves"].includes(body.field)) {
    return NextResponse.json({ message: "invalid field" }, { status: 400 });
  }
  const result = await incrementReaction(id, body.field);
  if (!result) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { getPublicNotes } from "@/lib/notes-store";

export async function GET() {
  return NextResponse.json({
    posts: await getPublicNotes()
  });
}

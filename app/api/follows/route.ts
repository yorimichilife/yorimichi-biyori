import { NextResponse } from "next/server";
import { getFollowedAuthors, getFollowedUserIds, toggleFollowUser } from "@/lib/auth-store";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ followedUserIds: [], authors: [] });
  }

  const [followedUserIds, authors] = await Promise.all([
    getFollowedUserIds(user.id),
    getFollowedAuthors(user.id)
  ]);
  return NextResponse.json({ followedUserIds, authors });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "フォローにはログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json()) as { followingId?: string };
  if (!body.followingId) {
    return NextResponse.json({ message: "フォロー対象が見つかりません。" }, { status: 400 });
  }

  try {
    const result = await toggleFollowUser(user.id, body.followingId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "フォロー操作に失敗しました。" },
      { status: 400 }
    );
  }
}

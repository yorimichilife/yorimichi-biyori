import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAccountProfile, updateAccountProfile } from "@/lib/mypage-store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const profile = await getAccountProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    handle?: string;
    bio?: string;
    avatar?: string;
  };

  if (!body.name?.trim() || !body.handle?.trim()) {
    return NextResponse.json({ message: "表示名とアカウントIDを入力してください。" }, { status: 400 });
  }

  try {
    const profile = await updateAccountProfile(user.id, {
      name: body.name,
      handle: body.handle,
      bio: body.bio || "",
      avatar: body.avatar || user.avatar
    });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "アカウント設定の保存に失敗しました。" },
      { status: 400 }
    );
  }
}

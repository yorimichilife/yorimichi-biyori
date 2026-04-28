import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-store";
import { getSessionUser } from "@/lib/session";

function getProviderStatus() {
  return {
    credentials: true,
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    x: Boolean(process.env.AUTH_X_ID && process.env.AUTH_X_SECRET),
    instagram: Boolean(process.env.AUTH_INSTAGRAM_ID && process.env.AUTH_INSTAGRAM_SECRET)
  };
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({
    user,
    providers: getProviderStatus()
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    mode?: "register";
    name?: string;
    email?: string;
    password?: string;
  };

  if (body.mode !== "register") {
    return NextResponse.json({ message: "このエンドポイントでは新規登録のみ受け付けています。" }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ message: "メールアドレスとパスワードを入力してください。" }, { status: 400 });
  }

  try {
    const user = await registerUser({
      name: body.name?.trim() || "旅人",
      email: body.email,
      password: body.password
    });
    return NextResponse.json({ user, mode: "register" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "新規登録に失敗しました。" },
      { status: 400 }
    );
  }
}

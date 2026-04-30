import { NextResponse } from "next/server";
import { addExpenseItem, getExpenseOverview } from "@/lib/mypage-store";
import { ExpenseCategory } from "@/lib/types";
import { getSessionUser } from "@/lib/session";

const categories: ExpenseCategory[] = ["カフェ", "旅行", "その他"];

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const overview = await getExpenseOverview(user.id, month);
  return NextResponse.json({ month, ...overview });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    category?: ExpenseCategory;
    amount?: number;
    spentAt?: string;
    noteId?: string | null;
  };

  if (!body.title?.trim() || !body.spentAt || !body.amount || !body.category || !categories.includes(body.category)) {
    return NextResponse.json({ message: "日付・項目名・カテゴリ・金額を入力してください。" }, { status: 400 });
  }

  try {
    const item = await addExpenseItem(user.id, {
      title: body.title,
      category: body.category,
      amount: Number(body.amount),
      spentAt: body.spentAt,
      noteId: body.noteId ?? null
    });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "家計簿の保存に失敗しました。" },
      { status: 400 }
    );
  }
}

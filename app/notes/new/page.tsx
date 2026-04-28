import { Container } from "@/components/ui";
import { NewNoteForm } from "@/components/forms/new-note-form";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { getSessionUser } from "@/lib/session";
import Link from "next/link";

export default async function NewNotePage() {
  const user = await getSessionUser();

  return (
    <Container className="space-y-8 py-8 md:py-12">
      <Link href="/notes" className="text-sm font-medium text-brand-sky">
        ← よりみち日記に戻る
      </Link>
      {user ? (
        <NewNoteForm />
      ) : (
        <LoginRequiredCard
          title="旅ノートの作成には会員登録が必要です"
          body="写真の追加、旅の記録、訪れた場所の登録、地図機能の利用は無料会員向け機能です。ログイン後すぐに使い始められます。"
        />
      )}
    </Container>
  );
}

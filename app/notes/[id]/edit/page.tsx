import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { NewNoteForm } from "@/components/forms/new-note-form";
import { getNoteById, isNoteOwner } from "@/lib/notes-store";
import { getSessionUser } from "@/lib/session";

export default async function EditNotePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNoteById(id);
  if (!note) notFound();
  const user = await getSessionUser();

  return (
    <Container className="space-y-8 py-8 md:py-12">
      <Link href={`/notes/${id}`} className="text-sm font-medium text-brand-sky">
        ← 旅ノート詳細に戻る
      </Link>
      {user && isNoteOwner(note, user) ? (
        <NewNoteForm initialNote={note} />
      ) : (
        <LoginRequiredCard
          title="この旅ノートは編集できません"
          body="編集と訪れた場所の更新は、作成者本人のログイン時のみ利用できます。別のアカウントで見ている場合は、作成したアカウントで入り直してください。"
        />
      )}
    </Container>
  );
}

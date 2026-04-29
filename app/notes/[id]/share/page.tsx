import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { Button, Card, Container } from "@/components/ui";
import { getNoteById, isNoteOwner } from "@/lib/notes-store";
import { getSessionUser } from "@/lib/session";
import { unstable_noStore as noStore } from "next/cache";
import { ShareSettingsForm } from "@/components/forms/share-settings-form";

export default async function SharePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const note = await getNoteById(id);
  if (!note) notFound();
  const user = await getSessionUser();

  return (
    <Container className="space-y-8 py-8 md:py-12">
      <Link href="/notes" className="text-sm font-medium text-brand-sky">
        ← よりみち日記へ戻る
      </Link>
      {user && isNoteOwner(note, user) ? (
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
          <Card className="order-2 h-fit p-5 xl:order-1">
            <div className="mb-4 text-2xl font-bold text-brand-text">共有する旅ノート</div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-2xl font-bold">{note.title}</h3>
              <p className="text-sm text-brand-sub">
                {note.dateRange}（{note.duration}）
              </p>
              <p className="text-sm leading-7 text-brand-sub">{note.summary}</p>
              <Button variant="secondary" href={`/notes/${note.id}`} className="w-full">
                旅ノートを開く
              </Button>
            </div>
          </Card>

          <div className="order-1 space-y-6 xl:order-2">
            <ShareSettingsForm note={note} />
          </div>

          <div className="order-3 space-y-6">
            <Card className="overflow-hidden">
              <div className="h-28 bg-[url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
              <div className="space-y-4 p-5">
                <div className="text-2xl font-bold text-brand-text">共有プレビュー</div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                  <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
                </div>
                <h3 className="text-2xl font-bold">{note.title}</h3>
                <p className="text-sm text-brand-sub">
                  {note.dateRange}（{note.duration}）
                </p>
                <p className="text-sm leading-7 text-brand-sub">{note.summary}</p>
              </div>
            </Card>
            <Card className="space-y-4 border-[#F3DB8D] bg-[#FFF9EA] p-5">
              <div className="text-2xl font-bold text-brand-text">共有のヒント</div>
              <ul className="space-y-2 text-sm leading-7 text-brand-sub">
                <li>URL限定公開なら、家族や友人に気軽に共有できます。</li>
                <li>パスワードを設定すると、より安心して共有できます。</li>
                <li>有効期限を設定すると、期間が過ぎると自動的にアクセスできなくなります。</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <LoginRequiredCard
          title="共有設定は作成者のみ変更できます"
          body="URL限定公開やパスワード設定、コメント許可の切り替えは、旅ノートの作成者本人だけが操作できます。"
        />
      )}
    </Container>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { Badge, Button, Card, Container } from "@/components/ui";
import { CommentForm } from "@/components/forms/comment-form";
import { canAccessSharedNote, getNoteById } from "@/lib/notes-store";
import { getSessionUser } from "@/lib/session";
import { CalendarDays, MapPin, UserRound } from "lucide-react";

export default async function SharedNotePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ password?: string }>;
}) {
  const { id } = await params;
  const { password } = await searchParams;
  const note = await getNoteById(id);
  const user = await getSessionUser();
  if (!note) notFound();

  const canAccess = canAccessSharedNote(note, password);

  return (
    <Container className="space-y-8 py-8 md:py-12">
      <Link href="/" className="text-sm font-medium text-brand-sky">
        ← よりみち日和へ戻る
      </Link>
      {!canAccess ? (
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <h1 className="font-accent text-4xl font-bold text-brand-text">この旅ノートは保護されています</h1>
          <p className="mt-4 text-brand-sub">
            非公開・期限切れ、またはパスワード未入力です。パスワード付きノートは `?password=...` を付けてアクセスできます。
          </p>
        </Card>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[28px]">
              <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
            </div>
            <Badge>{note.status === "public" ? "公開中" : "URL限定公開"}</Badge>
            <div className="space-y-4">
              <h1 className="font-accent text-4xl font-bold text-brand-text md:text-5xl">{note.title}</h1>
              <p className="text-lg leading-8 text-brand-sub">{note.summary}</p>
              <div className="flex flex-wrap gap-5 text-sm text-brand-sub">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {note.dateRange}
                </span>
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {note.companions}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {note.prefecture}
                </span>
              </div>
            </div>
            <div className="space-y-8">
              {note.days.map((day) => (
                <section key={day.day} className="space-y-4 rounded-[28px] border border-brand-border bg-white p-6">
                  <div className="text-2xl font-bold text-brand-text">{day.day}日目</div>
                  <div className="text-sm text-brand-sub">{day.date}</div>
                  <h2 className="text-2xl font-bold text-brand-text">{day.title}</h2>
                  <p className="text-sm leading-8 text-brand-sub">{day.body}</p>
                  <div className="grid gap-4 md:grid-cols-4">
                    {day.photos.map((photo) => (
                      <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                        <Image src={photo} alt={day.title} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {note.share.allowComments ? (
              <Card className="space-y-5 p-6">
                <h2 className="text-3xl font-bold text-brand-text">コメント</h2>
                {user ? (
                  <CommentForm noteId={note.id} />
                ) : (
                  <LoginRequiredCard
                    title="コメントにはログインが必要です"
                    body="共有ページの閲覧はそのままできますが、コメント投稿は無料会員登録後に利用できます。"
                  />
                )}
                <div className="space-y-4">
                  {(note.commentItems ?? []).map((comment) => (
                    <div key={comment.id} className="rounded-3xl bg-brand-bg p-4">
                      <div className="text-sm font-bold text-brand-text">{comment.name}</div>
                      <p className="mt-2 text-sm leading-7 text-brand-sub">{comment.body}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
          <div className="space-y-6">
            <Card className="space-y-4 p-6">
              <h3 className="text-2xl font-bold text-brand-text">この旅ノートについて</h3>
              <p className="text-sm leading-7 text-brand-sub">共有 URL から閲覧できる公開ページです。旅の記録をそのまま家族や友人に届けられます。</p>
              <Button href={`/notes/${note.id}`} variant="secondary" className="w-full">
                管理画面を見る
              </Button>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}

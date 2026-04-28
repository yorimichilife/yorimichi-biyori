import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { Button, Card, Container, Badge } from "@/components/ui";
import { MapCard } from "@/components/map-card";
import { CalendarDays, Heart, UserRound } from "lucide-react";
import { canViewNote, getNoteById, getPublicNotes, isNoteOwner } from "@/lib/notes-store";
import { getSessionUser } from "@/lib/session";
import { unstable_noStore as noStore } from "next/cache";
import { CommentForm } from "@/components/forms/comment-form";
import { ReactionPanel } from "@/components/notes/reaction-panel";
import { PdfButton } from "@/components/notes/pdf-button";

export default async function NoteDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const note = await getNoteById(id);
  const user = await getSessionUser();
  const publicNotes = (await getPublicNotes()).filter((item) => item.id !== id);

  if (!note || !canViewNote(note, user)) {
    notFound();
  }

  const owner = isNoteOwner(note, user);

  return (
    <Container className="space-y-8 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <Link href={owner ? "/notes" : "/blog"} className="text-sm font-medium text-brand-sky">
          ← {owner ? "よりみち日記に戻る" : "みんなのよりみちに戻る"}
        </Link>
        <div className="flex gap-3">
          {owner ? <Button variant="secondary" href={`/notes/${note.id}/edit`}>編集する</Button> : null}
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-white">
            …
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[28px]">
            <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
          </div>
          <Badge>{note.status === "unlisted" ? "URL限定公開" : note.status === "public" ? "公開中" : note.status === "draft" ? "下書き" : "非公開"}</Badge>
          <div className="space-y-4">
            <h1 className="font-accent text-4xl font-bold text-brand-text md:text-5xl">{note.title}</h1>
            <p className="text-lg leading-8 text-brand-sub">{note.summary}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-brand-sub">
              <span className="inline-flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image src={note.author.avatar} alt={note.author.name} fill className="object-cover" />
                </div>
                {note.author.name}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {note.dateRange}（{note.duration}）
              </span>
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                {note.companions}
              </span>
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4" />
                保存 {note.saves}
              </span>
            </div>
          </div>

          <div className="border-b border-brand-border">
            <div className="flex flex-wrap gap-8 text-base font-medium text-brand-sub">
              {["旅の記録", "訪れた場所", "旅のメモ", "費用メモ", "コメント"].map((tab, index) => (
                <button
                  key={tab}
                  className={`border-b-[3px] pb-4 ${index === 0 ? "border-brand-yellow font-bold text-brand-text" : "border-transparent"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            {note.days.map((day) => (
              <section key={day.day} className="space-y-5 border-b border-brand-border pb-8">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-brand-text">{day.day}日目</div>
                  <div className="text-brand-sub">{day.date}</div>
                </div>
                <h2 className="text-2xl font-bold text-brand-text">{day.title}</h2>
                <p className="max-w-3xl text-sm leading-8 text-brand-sub">{day.body}</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {day.photos.map((photo) => (
                    <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                      <Image src={photo} alt={day.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="space-y-5">
            <h2 className="text-3xl font-bold text-brand-text">コメント（{note.commentItems?.length ?? note.comments}）</h2>
            {user ? (
              <div className="flex gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <CommentForm noteId={note.id} />
                </div>
              </div>
            ) : (
              <LoginRequiredCard
                title="コメントにはログインが必要です"
                body="公開記事はゲストでも読めますが、コメント投稿や保存、旅ノート作成などの参加機能は無料会員向けです。"
              />
            )}
            <div className="space-y-4">
              {(note.commentItems ?? []).map((comment) => (
                <div key={comment.id} className="rounded-3xl border border-brand-border bg-white p-4">
                  <div className="text-sm font-bold text-brand-text">{comment.name}</div>
                  <div className="mt-1 text-xs text-brand-sub">{new Date(comment.createdAt).toLocaleDateString("ja-JP")}</div>
                  <p className="mt-3 text-sm leading-7 text-brand-sub">{comment.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <ReactionPanel noteId={note.id} likes={note.likes} saves={note.saves} shareUrl={note.share.shareUrl} />

          <Card className="space-y-5 p-6">
            <h3 className="text-2xl font-bold text-brand-text">旅ノートの基本情報</h3>
            <InfoRow label="旅行先" value={note.prefecture} />
            <InfoRow label="旅行期間" value={`${note.dateRange}（${note.duration}）`} />
            <InfoRow label="同行者" value={note.companions} />
            <InfoRow label="旅行のスタイル" value={note.style.join(" / ")} />
            <div className="space-y-2">
              <div className="text-sm font-bold text-brand-text">旅のテーマ（任意）</div>
              <div className="flex flex-wrap gap-2">
                {note.theme.map((item) => (
                  <Badge key={item} tone="gray">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {user ? (
            <MapCard
              spots={note.spots}
              areaLabel={note.area}
              publicNotes={publicNotes}
              memoryPhotos={note.days.flatMap((day) =>
                day.photos.slice(0, 1).map((image, index) => ({
                  id: `${day.day}-${index}`,
                  title: day.title || `${day.day}日目`,
                  image
                }))
              )}
            />
          ) : (
            <LoginRequiredCard
              title="地図機能は会員向けです"
              body="訪れた場所の地図表示やスポット管理は、ログイン後に使える旅ノート機能です。閲覧のみの場合は記事本文と写真をそのままお楽しみください。"
            />
          )}

          <Card className="space-y-4 p-6">
            <h3 className="text-2xl font-bold text-brand-text">この旅ノートの公開設定</h3>
            <div className="rounded-2xl bg-[#FFF9E5] px-4 py-4 text-sm text-brand-text">
              {note.status === "unlisted" ? "URL限定公開" : note.status === "public" ? "全体公開" : note.status === "draft" ? "下書き" : "非公開"}
            </div>
            {owner ? (
              <Button href={`/notes/${note.id}/share`} variant="secondary" className="w-full">
                公開設定を変更
              </Button>
            ) : null}
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="text-2xl font-bold text-brand-text">タグ</h3>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} tone="gray">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="text-2xl font-bold text-brand-text">旅ノートをPDFで保存</h3>
            <p className="text-sm leading-7 text-brand-sub">この旅の記録をPDFにして保存できます。</p>
            <PdfButton />
          </Card>
        </div>
      </div>
    </Container>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-bold text-brand-text">{label}</div>
      <div className="text-sm text-brand-sub">{value}</div>
    </div>
  );
}

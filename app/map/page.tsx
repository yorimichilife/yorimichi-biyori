import Link from "next/link";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { MapCard } from "@/components/map-card";
import { NoteCard } from "@/components/note-card";
import { Badge, Button, Card, Container, SectionTitle } from "@/components/ui";
import { getNotesByUser, getPublicNotes } from "@/lib/notes-store";
import { getSessionUser } from "@/lib/session";
import { unstable_noStore as noStore } from "next/cache";
import { Compass, MapPinned, Route, Sparkles } from "lucide-react";
import Image from "next/image";

function uniqueStrings(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

export default async function MapPage() {
  noStore();
  const [user, publicNotes] = await Promise.all([getSessionUser(), getPublicNotes()]);
  const userNotes = user ? await getNotesByUser(user.id) : [];
  const recentUserNote = userNotes[0] ?? null;
  const mapArea = recentUserNote?.area ?? publicNotes[0]?.area ?? "日本";
  const mapSpots = uniqueStrings([
    ...(recentUserNote?.spots ?? []),
    ...publicNotes.flatMap((note) => note.spots)
  ]).slice(0, 8);
  const memoryPhotos = (recentUserNote?.days ?? publicNotes[0]?.days ?? [])
    .flatMap((day) =>
      day.photos.slice(0, 1).map((image, index) => ({
        id: `${day.day}-${index}`,
        title: day.title || `${day.day}日目`,
        image
      }))
    )
    .slice(0, 6);
  const pickupNotes = [...publicNotes].sort((a, b) => b.likes - a.likes).slice(0, 3);
  const latestNotes = [...publicNotes].slice(0, 6);

  return (
    <div className="space-y-12 py-8 md:space-y-16 md:py-12">
      <Container>
        <section className="paper-panel route-dots overflow-hidden rounded-[36px] border border-brand-border bg-white px-5 py-8 md:px-10 md:py-12">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_360px] xl:items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5D7] px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#B88A00]">
                <Compass className="h-4 w-4" />
                YORIMICHI MAP
              </div>
              <div className="space-y-4">
                <h1 className="font-accent text-4xl font-bold leading-[1.4] text-brand-text md:text-6xl">
                  よりみちを、
                  <br />
                  地図の上でも思い出に。
                </h1>
                <p className="max-w-2xl text-sm leading-8 text-brand-sub md:text-base">
                  公開されたよりみち日記を眺めながら、次に歩いてみたい街を探せます。ログインすると、自分の写真や訪れた場所も地図に重ねて、旅の流れごと残せます。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/notes/new">よりみち日記を書く</Button>
                <Button href="/blog" variant="secondary">
                  みんなのよりみちを見る
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="postcard-grid p-5">
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-[24px] bg-[#FFFDF6]">
                  <Image src="/illustrations/card-map.svg" alt="公開スポットのイラスト" fill className="object-cover" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4C3] text-[#B88A00]">
                    <MapPinned className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-text">公開よりみちスポット</div>
                    <div className="text-xs text-brand-sub">日記から拾った場所を地図でたどれます</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {mapSpots.slice(0, 6).map((spot) => (
                    <Badge key={spot} tone="gray">
                      {spot}
                    </Badge>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-[24px] bg-[#F6FBFF]">
                  <Image src="/illustrations/card-route.svg" alt="思い出マップのイラスト" fill className="object-cover" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4FF] text-brand-sky">
                    <Route className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-text">自分だけの思い出マップ</div>
                    <div className="text-xs text-brand-sub">写真・日記・訪れた場所をひとつにまとめます</div>
                  </div>
                </div>
                <div className="mt-4 text-sm leading-7 text-brand-sub">
                  {user
                    ? `最近のよりみち日記「${recentUserNote?.title ?? "最初の一冊"}」を地図に重ねて見返せます。`
                    : "ログインすると、あなたのよりみち日記をもとにした思い出マップを作れます。"}
                </div>
              </Card>
            </div>
          </div>
        </section>
      </Container>

      <Container className="space-y-12">
        <section className="space-y-6">
          <SectionTitle
            eyebrow="TRAVEL FLOW"
            title="よりみちマップ"
            subtitle="今いる場所の近くにある公開日記と、旅先で残した写真ピンを同じ地図で見られます。"
          />
          <MapCard
            spots={mapSpots}
            areaLabel={mapArea}
            publicNotes={publicNotes}
            memoryPhotos={memoryPhotos}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Card className="paper-panel p-6">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[24px] bg-[#FFFDF6]">
              <Image src="/illustrations/card-share.svg" alt="人気のよりみちイラスト" fill className="object-cover" />
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#D59A00]" />
              <h2 className="text-xl font-bold text-brand-text">人気のよりみち</h2>
            </div>
            <div className="mt-5 space-y-4">
              {pickupNotes.map((note, index) => (
                <Link key={note.id} href={`/notes/${note.id}`} className="flex items-start gap-4 rounded-3xl bg-brand-bg px-4 py-4 transition hover:bg-[#FFF9E4]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#B88A00]">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-brand-text">{note.title}</div>
                    <div className="mt-1 text-sm text-brand-sub">{note.prefecture}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="paper-panel p-6">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[24px] bg-[#F6FBFF]">
              <Image src="/illustrations/card-planner.svg" alt="歩いた流れのイラスト" fill className="object-cover" />
            </div>
            <div className="flex items-center gap-3">
              <Route className="h-5 w-5 text-brand-sky" />
              <h2 className="text-xl font-bold text-brand-text">歩いた流れを残す</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-brand-sub">
              <p>訪れた場所を日記に入れると、写真ピンと一緒に地図へ並びます。</p>
              <p>旅の準備中はしおりを使い、旅のあとにはよりみち日記として思い出へつなげられます。</p>
              <Button href="/shiori/new" variant="secondary" className="w-full">
                しおりを作る
              </Button>
            </div>
          </Card>

          <Card className="paper-panel p-6">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[24px] bg-[#FFFDF6]">
              <Image src="/illustrations/card-diary.svg" alt="自分の思い出マップのイラスト" fill className="object-cover" />
            </div>
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-[#D59A00]" />
              <h2 className="text-xl font-bold text-brand-text">自分の思い出マップ</h2>
            </div>
            <div className="mt-5">
              {user ? (
                <div className="space-y-3 text-sm leading-7 text-brand-sub">
                  <p>あなたのよりみち日記をもとに、旅先の写真や訪問先を静かに地図へ重ねていけます。</p>
                  <Button href="/notes" className="w-full">
                    自分のよりみち日記を見る
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 text-sm leading-7 text-brand-sub">
                  <p>思い出ピンの保存や自分専用の地図作成は、無料会員登録後に使えます。</p>
                  <Button href="/auth" className="w-full">
                    無料会員登録 / ログイン
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section className="space-y-6">
          <SectionTitle
            eyebrow="PUBLIC DIARIES"
            title="地図から見つける、みんなのよりみち"
            subtitle="公開されたよりみち日記を地図気分でたどれるように、新着の記録をまとめています。"
          />
          {latestNotes.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {latestNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <p className="text-sm leading-7 text-brand-sub">
                まだ公開よりみちはありません。最初の一冊が公開されると、ここに地図からたどれる日記が並びます。
              </p>
            </Card>
          )}
        </section>

        {!user ? (
          <section>
            <LoginRequiredCard
              title="思い出マップの保存にはログインが必要です"
              body="公開されているよりみちはそのまま読めます。自分だけの写真ピンや訪れた場所の記録を育てるには、無料会員登録をどうぞ。"
            />
          </section>
        ) : null}
      </Container>
    </div>
  );
}

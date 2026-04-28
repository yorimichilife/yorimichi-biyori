import { Hero } from "@/components/hero";
import { Button, Card, Container, SectionTitle } from "@/components/ui";
import { featureItems } from "@/lib/data";
import { Camera, CalendarDays, MapPin, NotebookPen, Share2 } from "lucide-react";
import { NoteCard } from "@/components/note-card";
import { getPublicNotes } from "@/lib/notes-store";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";

const icons = {
  camera: Camera,
  pen: NotebookPen,
  "map-pin": MapPin,
  calendar: CalendarDays,
  "share-2": Share2
};

const featureArt = {
  "写真をまとめる": "/illustrations/card-photos.svg",
  "日記を書く": "/illustrations/card-diary.svg",
  "訪れた場所を記録": "/illustrations/card-map.svg",
  "旅のしおりを作る": "/illustrations/card-planner.svg",
  "共有・公開する": "/illustrations/card-share.svg"
} as const;

export default async function HomePage() {
  noStore();
  const publicNotes = await getPublicNotes();
  const pickupNotes = [...publicNotes].sort((a, b) => b.likes - a.likes).slice(0, 3);
  const latestNotes = [...publicNotes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div className="space-y-16 pb-10 md:space-y-20">
      <Hero />

      <Container className="space-y-16 pt-12 md:space-y-20 md:pt-16">
        <section className="space-y-8 md:space-y-10">
          <SectionTitle
            eyebrow="WHAT YOU CAN DO"
            title="よりみち日和でできること"
            subtitle="よりみちを日記のように思い出へ残し、あとから何度でもやさしく振り返れるように。"
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {featureItems.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons];
              return (
                <Card key={item.title} className="paper-panel overflow-hidden space-y-4 p-5 text-center md:p-6">
                  <div className="relative -mx-5 -mt-5 aspect-[16/9] overflow-hidden rounded-b-[28px] bg-[#FFFDF6] md:-mx-6 md:-mt-6">
                    <Image src={featureArt[item.title as keyof typeof featureArt]} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8DD] text-[#D69B00]">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-brand-text">{item.title}</h3>
                    <p className="text-sm leading-7 text-brand-sub">{item.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-6 md:space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="PICK UP"
              title="ピックアップよりみち"
              subtitle="たくさんの公開日記の中から、今読みたくなるよりみちを集めました。"
            />
            <a className="text-sm font-medium text-brand-sky" href="/blog">
              みんなのよりみちをもっと見る
            </a>
          </div>
          {pickupNotes.length ? (
            <div className="grid gap-6 xl:grid-cols-3">
              {pickupNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <p className="text-sm leading-7 text-brand-sub">
                まだ公開されたよりみち日記はありません。最初の思い出を、日記のように残してみましょう。
              </p>
            </Card>
          )}
        </section>

        <section className="space-y-6 md:space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="LATEST"
              title="新着のよりみち日記"
              subtitle="新しく公開された思い出を眺めながら、次のよりみちのヒントを探せます。"
            />
            <Button href="/blog" variant="secondary">
              新着を一覧で見る
            </Button>
          </div>
          {latestNotes.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {latestNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <p className="text-sm leading-7 text-brand-sub">
                公開日記が増えると、ここに新着のよりみちが並びます。
              </p>
            </Card>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Card className="paper-panel overflow-hidden bg-gradient-to-r from-[#FFF5D7] to-[#FFFDF4] p-6 md:p-8">
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[28px] bg-white/60">
              <Image src="/illustrations/card-diary.svg" alt="よりみち日記のイラスト" fill className="object-cover" />
            </div>
            <div className="space-y-5">
              <h3 className="font-accent text-3xl font-bold">よりみち日記を書いてみる</h3>
              <p className="max-w-md text-sm leading-7 text-brand-sub">
                旅の途中で見つけた景色も、帰ってからふと思い出した気持ちも、日記のように静かに残していけます。
              </p>
              <Button href="/notes/new">新しいよりみち日記を書く</Button>
            </div>
          </Card>
          <Card className="paper-panel overflow-hidden bg-gradient-to-r from-[#EEF5FF] to-[#FDFCF6] p-6 md:p-8">
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[28px] bg-white/60">
              <Image src="/illustrations/card-planner.svg" alt="しおり作成のイラスト" fill className="object-cover" />
            </div>
            <div className="space-y-5">
              <h3 className="font-accent text-3xl font-bold">旅前のしおりも整えられる</h3>
              <p className="max-w-md text-sm leading-7 text-brand-sub">
                行きたい場所や予定を先にまとめておけば、そのまま旅の思い出へつながっていきます。
              </p>
              <Button href="/shiori/new" variant="secondary">
                しおりを作る
              </Button>
            </div>
          </Card>
          <Card className="paper-panel overflow-hidden bg-gradient-to-r from-[#FFFDF4] to-[#F6FBFF] p-6 md:p-8">
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[28px] bg-white/60">
              <Image src="/illustrations/card-map.svg" alt="よりみちマップのイラスト" fill className="object-cover" />
            </div>
            <div className="space-y-5">
              <h3 className="font-accent text-3xl font-bold">よりみちマップでたどる</h3>
              <p className="max-w-md text-sm leading-7 text-brand-sub">
                公開日記の行き先や、自分の旅先で撮った写真ピンを地図の上で眺めながら、思い出の流れをたどれます。
              </p>
              <Button href="/map" variant="secondary">
                よりみちマップを見る
              </Button>
            </div>
          </Card>
        </section>

        <section className="space-y-8 md:space-y-10">
          <SectionTitle eyebrow="HOW IT WORKS" title="使い方はかんたん3ステップ" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["01", "よりみち日記を書く", "写真やことばで、その日の空気ごと残します。"],
              ["02", "地図やしおりとつなぐ", "歩いた場所や行きたかった場所を、思い出の流れに重ねます。"],
              ["03", "みんなのよりみちへひらく", "公開すると、誰かの次の旅のきっかけにもなります。"]
            ].map(([step, title, body]) => (
              <Card key={step} className="paper-panel p-6 md:p-7">
                <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[24px] bg-[#FFFDF6]">
                  <Image
                    src={step === "01" ? "/illustrations/card-diary.svg" : step === "02" ? "/illustrations/card-route.svg" : "/illustrations/card-share.svg"}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <span className="font-accent text-2xl font-bold text-[#D59A00]">{step}</span>
                  <h3 className="text-2xl font-bold text-brand-text">{title}</h3>
                  <p className="text-sm leading-7 text-brand-sub">{body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}

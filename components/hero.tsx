import { Button, Container } from "@/components/ui";
import { BookOpenText, Compass, Globe, Search, Share2 } from "lucide-react";
import type { ReactNode } from "react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(38,53,71,.56) 0%, rgba(38,53,71,.20) 44%, rgba(38,53,71,.06) 100%), url('https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1800&q=80')"
        }}
      />
      <div className="absolute -left-12 top-20 h-40 w-40 rounded-full bg-[#F4C400]/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <Container className="relative py-16 text-white md:py-24">
        <div className="max-w-[620px] space-y-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-white/92">
              <Compass className="h-4 w-4" />
              YORIMICHI DIARY
            </div>
            <h1 className="font-accent text-4xl font-bold leading-[1.45] md:text-6xl">
              よりみちを、
              <br />
              日記のように思い出へ残そう。
            </h1>
            <p className="max-w-[520px] text-base leading-8 text-white/88 md:text-lg md:leading-9">
              ふと立ち寄った景色も、ことばにした余韻も、歩いた道も。旅のよりみちを、あなたらしい日記として残せます。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Feature icon={<BookOpenText className="h-7 w-7" />} title="よりみち日記" subtitle="写真とことばで旅の余韻を残す" />
            <Feature icon={<Share2 className="h-7 w-7" />} title="思い出を共有" subtitle="大切な人へそっと届けられる" />
            <Feature icon={<Globe className="h-7 w-7" />} title="みんなのよりみち" subtitle="公開された日記から次の旅に出会う" />
          </div>
        </div>
        <div className="paper-panel mt-12 rounded-[28px] border border-white/70 bg-white p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:rounded-full">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3 text-brand-sub md:px-5 md:py-4">
              <Search className="h-5 w-5" />
              <span className="text-sm md:text-base">公開されたよりみちを探す（例：鎌倉、温泉、カフェ）</span>
            </div>
            <Button href="/notes/new" className="h-12 px-6 md:h-14 md:px-10">
              よりみち日記を書いてみる（無料）
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Feature({
  icon,
  title,
  subtitle
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 border-r border-white/25 pr-5 last:border-r-0">
      <div className="mt-1">{icon}</div>
      <div>
        <div className="font-bold">{title}</div>
        <div className="mt-1 text-sm leading-6 text-white/78">{subtitle}</div>
      </div>
    </div>
  );
}

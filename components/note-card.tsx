import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Bookmark, Heart, MessageCircle, UserRound, Lock, Globe, Link2 } from "lucide-react";
import { Note, Privacy } from "@/lib/types";
import { Badge, Card } from "@/components/ui";

const statusMap: Record<Privacy, { label: string; icon: ReactNode; tone: "yellow" | "green" | "gray" | "blue" }> = {
  public: { label: "公開中", icon: <Globe className="h-3 w-3" />, tone: "green" },
  unlisted: { label: "URL限定公開", icon: <Link2 className="h-3 w-3" />, tone: "yellow" },
  private: { label: "非公開", icon: <Lock className="h-3 w-3" />, tone: "gray" },
  draft: { label: "下書き", icon: <Bookmark className="h-3 w-3" />, tone: "blue" }
};

const art = {
  coffee: "/yorimichi-transparent-assets/asset-003.png",
  cake: "/yorimichi-transparent-assets/asset-004.png",
  sign: "/yorimichi-transparent-assets/asset-006.png",
  branch: "/yorimichi-transparent-assets/asset-013.png",
  shop: "/yorimichi-transparent-assets/asset-017.png",
  map: "/yorimichi-transparent-assets/asset-018.png",
  flowerCircle: "/yorimichi-transparent-assets/asset-031.png",
  brownCircle: "/yorimichi-transparent-assets/asset-032.png",
  sea: "/yorimichi-transparent-assets/asset-062.png",
  alley: "/yorimichi-transparent-assets/asset-063.png",
  diary: "/yorimichi-transparent-assets/asset-065.png",
  flower: "/yorimichi-transparent-assets/asset-049.png",
  tape: "/yorimichi-transparent-assets/asset-043.png"
} as const;

export function NoteCard({ note, href = `/notes/${note.id}` }: { note: Note; href?: string }) {
  const status = statusMap[note.status];
  const sticker =
    note.style.includes("カフェ")
      ? art.coffee
      : note.style.includes("散歩")
        ? art.sign
        : note.style.includes("旅行")
          ? art.map
          : note.style.includes("観光・街歩き")
            ? art.shop
            : art.diary;
  const floatingPhoto =
    note.prefecture.includes("鎌倉") || note.prefecture.includes("沖縄")
      ? art.sea
      : note.prefecture.includes("京都") || note.prefecture.includes("石川")
        ? art.alley
        : art.cake;

  return (
    <Card className="paper-panel overflow-hidden border-[#EEE6D7]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge tone={status.tone}>
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </Badge>
        </div>
        <Image src={art.tape} alt="" width={72} height={20} className="absolute right-5 top-4 opacity-90" />
        <div className="absolute bottom-3 right-3 rounded-[22px] border-4 border-white bg-white/90 p-1 shadow-sm">
          <Image src={sticker} alt="" width={46} height={46} className="rounded-2xl object-contain" />
        </div>
      </div>
      <div className="relative space-y-4 p-4 sm:p-5">
        <Image src={art.branch} alt="" width={34} height={34} className="absolute right-4 top-4 opacity-80" />
        <Link href={href} className="block">
          <h3 className="line-clamp-2 pr-10 text-xl font-bold tracking-[-0.02em] text-brand-text sm:text-2xl">
            {note.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-sub">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {note.dateRange}
          </span>
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-4 w-4" />
            {note.companions}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-7 text-brand-sub">{note.summary}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image src={note.author.avatar} alt={note.author.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-brand-sub">{note.author.name}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-[#D86B55]">
                <Heart className="h-3.5 w-3.5 fill-current" />
                {note.likes}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-brand-sub">
            <span className="inline-flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              {note.saves}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {note.comments}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-[22px] border border-[#F0E5D5] bg-[#FFFDF7] px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-brand-sub sm:text-sm">
            <Image src={art.flowerCircle} alt="" width={18} height={18} className="opacity-85" />
            <span>{note.prefecture}</span>
          </div>
          <Image src={floatingPhoto} alt="" width={34} height={34} className="rounded-xl object-cover" />
        </div>
      </div>
    </Card>
  );
}

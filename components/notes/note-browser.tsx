"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Compass, Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";
import { NoteCard } from "@/components/note-card";
import { Badge, Button } from "@/components/ui";
import type { Note, SortOption } from "@/lib/types";
import { cn } from "@/lib/utils";

const art = {
  branch: "/yorimichi-transparent-assets/asset-013.png",
  coffee: "/yorimichi-transparent-assets/asset-003.png",
  map: "/yorimichi-transparent-assets/asset-018.png",
  diary: "/yorimichi-transparent-assets/asset-065.png",
  avatar: "/yorimichi-transparent-assets/asset-054.png",
  dotted: "/yorimichi-transparent-assets/asset-046.png",
  flower: "/yorimichi-transparent-assets/asset-049.png",
  paper: "/yorimichi-transparent-assets/asset-044.png"
} as const;

export function NotesBrowser({ notes }: { notes: Note[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState("すべて");

  const filtered = useMemo(() => {
    const statusMap: Record<string, string | null> = {
      すべて: null,
      公開中: "public",
      URL限定公開: "unlisted",
      非公開: "private",
      下書き: "draft"
    };
    const normalized = query.trim().toLowerCase();
    const status = statusMap[tab];
    const list = notes.filter((note) => {
      const hay = [note.title, note.prefecture, note.summary, ...note.tags, ...note.style].join(" ").toLowerCase();
      const matchesQuery = !normalized || hay.includes(normalized);
      const matchesStatus = !status || note.status === status;
      return matchesQuery && matchesStatus;
    });
    return list.sort((a, b) => {
      if (sort === "oldest") return a.updatedAt.localeCompare(b.updatedAt);
      if (sort === "popular") return b.likes - a.likes;
      if (sort === "saved") return b.saves - a.saves;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [notes, query, sort, tab]);

  return (
    <>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image src={art.branch} alt="" width={26} height={26} className="opacity-80" />
            <div className="font-accent text-3xl font-bold text-brand-text md:text-4xl">よりみち日記</div>
          </div>
          <p className="text-sm leading-7 text-brand-sub md:text-base">
            旅の途中で出会った風景や気持ちを、日記のようにやさしく残していけます。
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5D7] px-3 py-1 text-xs font-bold tracking-[0.18em] text-[#B88A00]">
            <Compass className="h-3.5 w-3.5" />
            MY YORIMICHI DIARY
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-full border border-brand-border bg-white px-4 md:h-14 md:px-5">
            <Search className="h-5 w-5 text-brand-sub" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none md:text-base" placeholder="よりみち日記を検索" />
          </label>
          <label className="flex h-12 items-center gap-2 rounded-full border border-brand-border px-4 font-medium text-brand-text md:h-14 md:px-5">
            <SlidersHorizontal className="h-4 w-4" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="bg-transparent text-sm outline-none md:text-base">
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="popular">人気順</option>
              <option value="saved">保存数順</option>
            </select>
          </label>
          <Button href="/notes/new" className="h-12 px-5 md:h-14 md:px-6">
            新しいよりみち日記を書く
          </Button>
        </div>
      </div>

      <div className="paper-panel mt-8 overflow-hidden rounded-[28px] border border-brand-border p-4 md:p-6">
        <div className="relative mb-6 overflow-hidden rounded-[26px] border border-[#EEE6D7] bg-[#FFFDF7] px-4 py-5 sm:px-6">
          <Image src={art.paper} alt="" fill className="object-cover opacity-30" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="text-sm font-bold tracking-[0.18em] text-[#8C6E4A]">DIARY OVERVIEW</div>
              <p className="text-sm leading-7 text-brand-sub sm:text-base">
                自分のよりみちを、やわらかなカードで一覧できます。公開状態や気分ごとの違いも、ひと目で振り返れます。
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-[24px] bg-white/90 px-4 py-3 shadow-sm">
              <Image src={art.coffee} alt="" width={34} height={34} className="rounded-xl" />
              <Image src={art.map} alt="" width={34} height={34} className="rounded-xl" />
              <Image src={art.diary} alt="" width={34} height={34} className="rounded-xl" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-5 text-sm font-medium md:gap-8 md:text-lg">
            {["すべて", "公開中", "URL限定公開", "非公開", "下書き"].map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`border-b-[3px] pb-3 ${tab === item ? "border-brand-yellow font-bold text-brand-text" : "border-transparent text-brand-sub"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-end rounded-2xl border border-brand-border p-2">
            <button onClick={() => setLayout("grid")} className={cn("rounded-xl p-3", layout === "grid" ? "bg-[#FFF6D6] text-brand-text" : "text-brand-sub")}>
              <Grid2X2 className="h-5 w-5" />
            </button>
            <button onClick={() => setLayout("list")} className={cn("rounded-xl p-3", layout === "list" ? "bg-[#FFF6D6] text-brand-text" : "text-brand-sub")}>
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
            <div className="rounded-3xl bg-brand-bg p-6 text-sm leading-7 text-brand-sub sm:p-8">
              <Image src={art.avatar} alt="" width={48} height={48} className="mb-3" />
              まだ条件に合うよりみち日記がありません。新しい日記を書いて、次の思い出をここに育ててみましょう。
            </div>
          ) : (
            <div className={layout === "grid" ? "grid gap-5 lg:grid-cols-2 xl:grid-cols-3" : "grid gap-5"}>
              {filtered.map((note) => (
                <div key={note.id} className={layout === "list" ? "max-w-none" : ""}>
                  <NoteCard
                    note={note}
                    actionSlot={
                      <>
                        <Link
                          href={`/notes/${note.id}/edit`}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-brand-border px-4 text-sm font-medium text-brand-text transition hover:bg-[#FFF7D5]"
                        >
                          編集する
                        </Link>
                        <Link
                          href={`/notes/${note.id}/share`}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-brand-border px-4 text-sm font-medium text-brand-text transition hover:bg-[#FFF7D5]"
                        >
                          共有設定
                        </Link>
                      </>
                    }
                  />
                </div>
              ))}
            </div>
          )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
          <Badge tone="gray">表示件数 {filtered.length}</Badge>
          <Badge tone="gray">検索語: {query || "なし"}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Image src={art.dotted} alt="" width={86} height={18} className="hidden sm:block opacity-80" />
            <Button href="/map" variant="ghost" className="h-10 px-4 text-sm">
              よりみちマップへ
            </Button>
            <Image src={art.flower} alt="" width={24} height={24} className="opacity-90" />
          </div>
        </div>
      </div>
    </>
  );
}

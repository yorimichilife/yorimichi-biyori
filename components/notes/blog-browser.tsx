"use client";

import { useMemo, useState } from "react";
import { Grid2X2, List, Search } from "lucide-react";
import { NoteCard } from "@/components/note-card";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import type { Note, SortOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function BlogBrowser({ notes }: { notes: Note[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [area, setArea] = useState("すべて");
  const [style, setStyle] = useState("すべて");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...notes]
      .filter((note) => {
        const hay = [note.title, note.prefecture, note.summary, ...note.tags, ...note.style].join(" ").toLowerCase();
        return (!normalized || hay.includes(normalized)) &&
          (area === "すべて" || note.area === area) &&
          (style === "すべて" || note.style.includes(style));
      })
      .sort((a, b) => {
        if (sort === "newest") return b.updatedAt.localeCompare(a.updatedAt);
        if (sort === "oldest") return a.updatedAt.localeCompare(b.updatedAt);
        if (sort === "saved") return b.saves - a.saves;
        return b.likes - a.likes;
      });
  }, [area, notes, query, sort, style]);

  return (
    <section className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <SectionTitle
          eyebrow="PUBLIC YORIMICHI"
          title="みんなのよりみち"
          subtitle="旅の思い出や体験を綴った、素敵なよりみち日記を公開しています。行ってみたい場所や旅のヒントがきっと見つかります。"
        />
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#FFFDF6]">
            <Image src="/illustrations/card-route.svg" alt="みんなのよりみちのイラスト" fill className="object-cover" />
          </div>
          <div className="border-b border-brand-border p-5">
            <div className="mb-4 text-lg font-bold">キーワード検索</div>
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-brand-border px-4">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent outline-none" placeholder="行き先・キーワードで検索" />
              <Search className="h-4 w-4 text-brand-sub" />
            </label>
          </div>
          <FilterSelect title="エリアから探す" value={area} onChange={setArea} items={["すべて", "北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"]} />
          <FilterSelect title="旅のスタイルから探す" value={style} onChange={setStyle} items={["すべて", "ひとり旅", "家族旅行", "カフェ巡り", "温泉", "自然", "観光・街歩き"]} />
          <div className="border-t border-brand-border p-5">
            <div className="mb-4 text-lg font-bold text-brand-text">人気のタグ</div>
            <div className="flex flex-wrap gap-2">
              {["#カフェ巡り", "#温泉", "#絶景", "#神社仏閣", "#離島", "#ハイキング", "#写真旅", "#街歩き"].map((tag) => (
                <button key={tag} onClick={() => setQuery(tag.replace("#", ""))}>
                  <Badge tone="gray">{tag}</Badge>
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <Button variant="secondary" className="w-full" onClick={() => { setQuery(""); setSort("popular"); setLayout("grid"); setArea("すべて"); setStyle("すべて"); }}>
              条件をリセット
            </Button>
          </div>
        </Card>
      </aside>
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/7] overflow-hidden">
            <Image src="/illustrations/card-share.svg" alt="公開よりみちのメインビジュアル" fill className="object-cover" />
          </div>
          <div className="bg-white p-8">
            <div className="max-w-lg space-y-4">
              <div className="flex gap-8 text-lg font-medium text-brand-text">
                {["人気", "新着", "おすすめ"].map((tab, index) => (
                  <button key={tab} onClick={() => setSort(index === 0 ? "popular" : "newest")} className={`border-b-[3px] pb-3 ${index === 0 ? "border-brand-yellow font-bold" : "border-transparent text-brand-sub"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="rounded-full border border-brand-border bg-white px-5 py-3 text-sm">
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="bg-transparent outline-none">
                    <option value="popular">人気順</option>
                    <option value="newest">新着順</option>
                    <option value="oldest">古い順</option>
                    <option value="saved">保存数順</option>
                  </select>
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-brand-border bg-white p-2">
                  <button onClick={() => setLayout("grid")} className={cn("rounded-xl p-3", layout === "grid" ? "bg-[#FFF6D6]" : "")}>
                    <Grid2X2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => setLayout("list")} className={cn("rounded-xl p-3", layout === "list" ? "bg-[#FFF6D6]" : "")}>
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <div className={layout === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "grid gap-5"}>
          {filtered.length ? (
            filtered.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))
          ) : (
            <Card className="col-span-full p-8">
              <div className="relative mb-5 aspect-[16/7] overflow-hidden rounded-[24px] bg-[#FFFDF6]">
                <Image src="/illustrations/card-diary.svg" alt="公開日記がまだない状態のイラスト" fill className="object-cover" />
              </div>
              <p className="text-sm leading-7 text-brand-sub">
                まだ条件に合うよりみち日記がありません。新しい思い出が公開されると、ここに並びます。
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ title, items, value, onChange }: { title: string; items: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="border-t border-brand-border p-5">
      <div className="mb-4 text-lg font-bold text-brand-text">{title}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-2xl border border-brand-border px-4">
        {items.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

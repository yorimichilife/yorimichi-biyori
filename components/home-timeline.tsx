"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Heart, Sparkles, Users } from "lucide-react";
import { Note, FollowedAuthor } from "@/lib/types";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { cn } from "@/lib/utils";

type TabKey = "recommended" | "latest" | "following";

export function HomeTimeline({
  recommended,
  latest,
  following,
  followedAuthors,
  isLoggedIn
}: {
  recommended: Note[];
  latest: Note[];
  following: Note[];
  followedAuthors: FollowedAuthor[];
  isLoggedIn: boolean;
}) {
  const initialTab: TabKey = isLoggedIn && following.length ? "following" : "recommended";
  const [tab, setTab] = useState<TabKey>(initialTab);

  const timeline = useMemo(() => {
    if (tab === "latest") return latest;
    if (tab === "following") return following;
    return recommended;
  }, [following, latest, recommended, tab]);

  return (
    <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="TIMELINE"
            title="ホームタイムライン"
            subtitle="おすすめ、新着、フォロー中の更新を、SNSのように流し読みできるホーム画面です。"
          />
          <div className="flex flex-wrap gap-2 rounded-full border border-brand-border bg-white p-2">
            <TimelineTab label="おすすめ" active={tab === "recommended"} onClick={() => setTab("recommended")} />
            <TimelineTab label="新着" active={tab === "latest"} onClick={() => setTab("latest")} />
            <TimelineTab label="フォロー中" active={tab === "following"} onClick={() => setTab("following")} />
          </div>
        </div>

        <div className="grid gap-5">
          {timeline.length ? (
            timeline.map((note) => <TimelineCard key={`${tab}-${note.id}`} note={note} />)
          ) : (
            <Card className="p-8">
              <p className="text-sm leading-7 text-brand-sub">
                {tab === "following"
                  ? "まだフォロー中ユーザーの公開日記はありません。気になる旅人をフォローすると、ここに更新が流れてきます。"
                  : "表示できる日記がまだありません。公開されたよりみちが増えると、ここにタイムラインとして並びます。"}
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/10] bg-[#FFFDF6]">
            <Image src="/illustrations/card-share.svg" alt="おすすめのよりみち" fill className="object-cover" />
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-lg font-bold text-brand-text">
              <Sparkles className="h-5 w-5 text-[#D59A00]" />
              おすすめの読み方
            </div>
            <p className="text-sm leading-7 text-brand-sub">
              気になる旅人をフォローすると、その人の新しいよりみちがホームの先頭に並びます。日記を読むほど、次の寄り道のヒントが見つかります。
            </p>
            <Button href="/blog" variant="secondary" className="w-full">
              みんなのよりみちを見る
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative aspect-[16/10] bg-[#F7FBFF]">
            <Image src="/illustrations/card-route.svg" alt="フォロー中ユーザーのイラスト" fill className="object-cover" />
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-lg font-bold text-brand-text">
              <Users className="h-5 w-5 text-brand-sky" />
              フォロー中の旅人
            </div>
            {followedAuthors.length ? (
              <div className="space-y-3">
                {followedAuthors.slice(0, 5).map((author) => (
                  <div key={author.id} className="flex items-center gap-3 rounded-2xl bg-brand-bg px-3 py-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full">
                      <Image src={author.avatar} alt={author.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-brand-text">{author.name}</div>
                      <div className="text-xs text-brand-sub">更新はホームで追いかけられます</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-brand-sub">
                まだフォロー中の旅人はいません。公開日記の詳細ページからフォローすると、更新がここに並びます。
              </p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

function TimelineTab({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-bold transition",
        active ? "bg-brand-yellow text-brand-text" : "text-brand-sub hover:bg-brand-bg"
      )}
    >
      {label}
    </button>
  );
}

function TimelineCard({ note }: { note: Note }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
        </div>
        <div className="space-y-5 p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image src={note.author.avatar} alt={note.author.name} fill className="object-cover" />
            </div>
            <div className="text-sm font-bold text-brand-text">{note.author.name}</div>
            <Badge tone={note.status === "public" ? "green" : "gray"}>{note.prefecture}</Badge>
          </div>
          <div className="space-y-3">
            <Link href={`/notes/${note.id}`} className="block text-3xl font-bold tracking-[-0.02em] text-brand-text">
              {note.title}
            </Link>
            <p className="text-sm leading-8 text-brand-sub">{note.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} tone="gray">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-brand-sub">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {note.dateRange}
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {note.likes} いいね
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

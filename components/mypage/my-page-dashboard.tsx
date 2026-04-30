"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import type { AccountProfile, ExpenseCategory, ExpenseItem, Note } from "@/lib/types";
import { CreditCard, Heart, MapPin, NotebookPen, Settings2, Wallet } from "lucide-react";

type ExpenseOverview = {
  month: string;
  items: ExpenseItem[];
  total: number;
  totals: Record<ExpenseCategory, number>;
};

export function MyPageDashboard({
  profile,
  ownNotes,
  likedNotes,
  recentNotes,
  visitedSpotCount,
  allTimeExpenseTotal,
  expenseOverview
}: {
  profile: AccountProfile;
  ownNotes: Note[];
  likedNotes: Note[];
  recentNotes: Note[];
  visitedSpotCount: number;
  allTimeExpenseTotal: number;
  expenseOverview: ExpenseOverview;
}) {
  const router = useRouter();
  const [profileState, setProfileState] = useState(profile);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [expenseState, setExpenseState] = useState(expenseOverview);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseMessage, setExpenseMessage] = useState("");

  const tabs = [
    { href: "#my-notes", label: "自分の日記", icon: <NotebookPen className="h-4 w-4" /> },
    { href: "#liked-notes", label: "いいねした記事", icon: <Heart className="h-4 w-4" /> },
    { href: "#kakeibo", label: "家計簿", icon: <Wallet className="h-4 w-4" /> }
  ];

  const expensePercentages = useMemo(() => {
    const total = expenseState.total || 1;
    return {
      cafe: Math.round((expenseState.totals["カフェ"] / total) * 100),
      travel: Math.round((expenseState.totals["旅行"] / total) * 100),
      other: Math.max(
        0,
        100 -
          Math.round((expenseState.totals["カフェ"] / total) * 100) -
          Math.round((expenseState.totals["旅行"] / total) * 100)
      )
    };
  }, [expenseState]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        handle: String(form.get("handle") || ""),
        bio: String(form.get("bio") || ""),
        avatar: String(form.get("avatar") || "")
      })
    });
    const data = await response.json();
    setProfileSaving(false);
    if (!response.ok) {
      setProfileMessage(data.message || "保存に失敗しました。");
      return;
    }
    setProfileState(data.profile);
    setProfileMessage("アカウント設定を更新しました。");
    window.dispatchEvent(new Event("yorimichi-auth-changed"));
    router.refresh();
  }

  async function loadMonth(month: string) {
    const response = await fetch(`/api/expenses?month=${month}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setExpenseMessage(data.message || "家計簿の読み込みに失敗しました。");
      return;
    }
    setExpenseState(data);
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExpenseSaving(true);
    setExpenseMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") || ""),
      category: String(form.get("category") || "") as ExpenseCategory,
      amount: Number(form.get("amount") || 0),
      spentAt: String(form.get("spentAt") || ""),
      noteId: null
    };

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setExpenseSaving(false);
    if (!response.ok) {
      setExpenseMessage(data.message || "家計簿の保存に失敗しました。");
      return;
    }

    setExpenseMessage("家計簿を追加しました。");
    await loadMonth(expenseState.month);
    (event.currentTarget as HTMLFormElement).reset();
  }

  async function moveMonth(diff: number) {
    const current = new Date(`${expenseState.month}-01T00:00:00+09:00`);
    current.setMonth(current.getMonth() + diff);
    await loadMonth(current.toISOString().slice(0, 7));
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="paper-panel overflow-hidden p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-[#EFE6D4] bg-[#FFFDF7]">
              <Image src={profileState.avatar} alt={profileState.name} fill className="object-cover" />
            </div>
            <a href="#account-settings" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-brand-border bg-white px-4 text-sm font-medium text-brand-text">
              <Settings2 className="h-4 w-4" />
              アカウント設定
            </a>
          </div>

          <div className="space-y-3 text-center">
            <h1 className="font-accent text-4xl font-bold text-brand-text">{profileState.name}</h1>
            <p className="text-base text-brand-sub">{profileState.handle}</p>
            <p className="text-sm leading-8 text-brand-sub">{profileState.bio}</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-y border-brand-border py-5 text-center">
            <StatCell label="投稿した日記" value={ownNotes.length} unit="件" />
            <StatCell label="訪れた場所" value={visitedSpotCount} unit="ヶ所" />
            <StatCell label="いいねした記事" value={likedNotes.length} unit="件" />
          </div>

          <div className="mt-5 rounded-[24px] border border-[#F0E5D5] bg-[#FFFBF0] px-5 py-4">
            <div className="text-xs font-medium tracking-[0.12em] text-[#8C6E4A]">これまでのより道支出合計</div>
            <div className="mt-2 text-3xl font-bold text-brand-text">¥ {allTimeExpenseTotal.toLocaleString("ja-JP")}</div>
          </div>

          <a
            href="#account-settings"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-brand-border bg-white px-5 text-sm font-medium text-brand-text"
          >
            プロフィールを編集する
          </a>
        </Card>

        <Card className="paper-panel overflow-hidden p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <h2 className="font-accent text-4xl font-bold text-brand-text">最近のより道</h2>
            </div>
            <Link href="/blog" className="text-sm font-medium text-brand-sub">
              すべて見る →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recentNotes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="group overflow-hidden rounded-[28px] border border-brand-border bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={note.coverImage} alt={note.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3">
                    <Badge tone={note.style.includes("カフェ") ? "green" : note.style.includes("散歩") ? "yellow" : "blue"}>
                      {note.style[0] || "旅"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="text-2xl font-bold leading-tight text-brand-text">{note.title}</div>
                  <div className="flex items-center gap-3 text-sm text-brand-sub">
                    <span>{note.startDate.replaceAll("-", ".")}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {note.prefecture}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#D86B55]">
                      <Heart className="h-4 w-4 fill-current" />
                      {note.likes}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="paper-panel overflow-hidden p-4 md:p-6">
        <div className="flex flex-wrap gap-3 border-b border-brand-border pb-4">
          {tabs.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-text transition hover:border-[#C7D3AA] hover:bg-[#FAF9EF]"
            >
              {tab.icon}
              {tab.label}
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section id="my-notes" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <h3 className="text-3xl font-bold text-brand-text">自分の日記</h3>
              </div>
              <Button href="/notes/new" className="h-11 px-5 text-sm">
                日記を書く
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {["すべて", "カフェ", "散歩", "旅行", "日常"].map((pill) => (
                <Badge key={pill} tone={pill === "すべて" ? "green" : "gray"}>
                  {pill}
                </Badge>
              ))}
            </div>

            <div className="space-y-3">
              {ownNotes.length ? (
                ownNotes.slice(0, 4).map((note) => <DiaryListItem key={note.id} note={note} />)
              ) : (
                <EmptyPanel body="まだ日記がありません。最初のよりみちを、ここからやさしく残していきましょう。" />
              )}
            </div>
            <Link href="/notes" className="block rounded-2xl border border-brand-border px-4 py-3 text-center text-sm font-medium text-brand-text">
              すべての日記を見る →
            </Link>
          </section>

          <section id="liked-notes" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-[#D86B55]" />
                <h3 className="text-3xl font-bold text-brand-text">いいねした記事</h3>
              </div>
              <Link href="/blog" className="text-sm font-medium text-brand-sub">
                すべて見る →
              </Link>
            </div>

            {likedNotes.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {likedNotes.slice(0, 4).map((note) => (
                  <MiniNoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <EmptyPanel body="まだいいねした記事がありません。みんなのよりみちで、心が動いた一冊を見つけてみましょう。" />
            )}
          </section>

          <section id="kakeibo" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#8AA060]" />
                <h3 className="text-3xl font-bold text-brand-text">家計簿</h3>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-brand-border bg-white px-3 py-2 text-sm">
                <button onClick={() => moveMonth(-1)} aria-label="前の月">‹</button>
                <span>{monthLabel(expenseState.month)}</span>
                <button onClick={() => moveMonth(1)} aria-label="次の月">›</button>
              </div>
            </div>

            <div className="rounded-[24px] border border-brand-border bg-white p-5">
              <div className="text-sm text-brand-sub">今月のより道支出合計</div>
              <div className="mt-3 text-5xl font-bold text-brand-text">¥ {expenseState.total.toLocaleString("ja-JP")}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ExpenseSummaryCard label="カフェ" amount={expenseState.totals["カフェ"]} percent={expensePercentages.cafe} tone="green" />
              <ExpenseSummaryCard label="旅行" amount={expenseState.totals["旅行"]} percent={expensePercentages.travel} tone="yellow" />
              <ExpenseSummaryCard label="その他" amount={expenseState.totals["その他"]} percent={expensePercentages.other} tone="gray" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center rounded-full" style={{ background: donutBackground(expensePercentages) }}>
                <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-white text-center">
                  <div className="text-xs text-brand-sub">合計</div>
                  <div className="mt-1 text-2xl font-bold text-brand-text">¥ {expenseState.total.toLocaleString("ja-JP")}</div>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] border border-brand-border bg-white p-4">
                <div className="text-sm font-bold text-brand-text">支出履歴</div>
                <div className="space-y-3">
                  {expenseState.items.length ? (
                    expenseState.items.slice(0, 6).map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                        <div>
                          <div className="text-brand-sub">{formatShortDate(item.spentAt)}</div>
                          <div className="font-medium text-brand-text">{item.title}</div>
                          <div className="mt-1">
                            <Badge tone={item.category === "カフェ" ? "green" : item.category === "旅行" ? "yellow" : "gray"}>
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="font-semibold text-brand-text">¥ {item.amount.toLocaleString("ja-JP")}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-brand-bg px-4 py-6 text-sm leading-7 text-brand-sub">
                      まだこの月の支出がありません。下の入力欄から追加できます。
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={addExpense} className="grid gap-3 rounded-[24px] border border-brand-border bg-[#FFFDF7] p-4">
              <div className="text-sm font-bold text-brand-text">新しい支出を追加</div>
              <div className="grid gap-3 md:grid-cols-2">
                <input name="title" required placeholder="例: 喫茶店モーニング" className="h-11 rounded-2xl border border-brand-border bg-white px-4 outline-none" />
                <input name="spentAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 rounded-2xl border border-brand-border bg-white px-4 outline-none" />
                <select name="category" defaultValue="カフェ" className="h-11 rounded-2xl border border-brand-border bg-white px-4 outline-none">
                  <option value="カフェ">カフェ</option>
                  <option value="旅行">旅行</option>
                  <option value="その他">その他</option>
                </select>
                <input name="amount" type="number" min="1" required placeholder="金額" className="h-11 rounded-2xl border border-brand-border bg-white px-4 outline-none" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-brand-sub">{expenseMessage}</div>
                <Button type="submit" disabled={expenseSaving} className="h-11 px-5 text-sm">
                  {expenseSaving ? "保存中..." : "支出を追加"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </Card>

      <section id="account-settings">
        <Card className="paper-panel p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-[#8AA060]" />
            <h3 className="text-3xl font-bold text-brand-text">アカウント設定</h3>
          </div>

          <form onSubmit={saveProfile} className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-text">表示名</span>
              <input name="name" defaultValue={profileState.name} required className="h-12 rounded-2xl border border-brand-border px-4 outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-text">アカウントID</span>
              <input name="handle" defaultValue={profileState.handle} required className="h-12 rounded-2xl border border-brand-border px-4 outline-none" />
            </label>
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-bold text-brand-text">プロフィール文</span>
              <textarea name="bio" defaultValue={profileState.bio} rows={4} className="rounded-3xl border border-brand-border px-4 py-3 outline-none" />
            </label>
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-bold text-brand-text">アイコン画像URL</span>
              <input name="avatar" defaultValue={profileState.avatar} className="h-12 rounded-2xl border border-brand-border px-4 outline-none" />
            </label>
            <div className="lg:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-brand-sub">{profileMessage}</div>
              <Button type="submit" disabled={profileSaving}>
                {profileSaving ? "保存中..." : "アカウント設定を保存する"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}

function StatCell({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-brand-sub">{label}</div>
      <div className="text-4xl font-bold text-brand-text">{value}</div>
      <div className="text-xs text-brand-sub">{unit}</div>
    </div>
  );
}

function DiaryListItem({ note }: { note: Note }) {
  return (
    <Link href={`/notes/${note.id}`} className="flex gap-4 rounded-[24px] border border-brand-border bg-white p-3 transition hover:bg-[#FFFDF7]">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
        <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          {(note.style.length ? note.style : ["日常"]).slice(0, 2).map((item) => (
            <Badge key={item} tone="gray">
              {item}
            </Badge>
          ))}
        </div>
        <div className="line-clamp-2 text-xl font-bold leading-tight text-brand-text">{note.title}</div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-sub">
          <span>{note.startDate.replaceAll("-", ".")}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {note.prefecture}
          </span>
          <span className="inline-flex items-center gap-1 text-[#D86B55]">
            <Heart className="h-4 w-4 fill-current" />
            {note.likes}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MiniNoteCard({ note }: { note: Note }) {
  return (
    <Link href={`/notes/${note.id}`} className="overflow-hidden rounded-[24px] border border-brand-border bg-white transition hover:bg-[#FFFDF7]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
      </div>
      <div className="space-y-2 p-3">
        <div className="line-clamp-2 text-lg font-bold text-brand-text">{note.title}</div>
        <div className="text-sm text-brand-sub">{note.prefecture}</div>
        <div className="inline-flex items-center gap-1 text-sm text-[#D86B55]">
          <Heart className="h-4 w-4 fill-current" />
          {note.likes}
        </div>
      </div>
    </Link>
  );
}

function ExpenseSummaryCard({
  label,
  amount,
  percent,
  tone
}: {
  label: string;
  amount: number;
  percent: number;
  tone: "green" | "yellow" | "gray";
}) {
  const toneClass = {
    green: "border-[#DCE7C8] bg-[#F7FAEF] text-[#708B46]",
    yellow: "border-[#F4D6A7] bg-[#FFF7ED] text-[#D87F26]",
    gray: "border-[#EAE5DA] bg-[#FFFDF7] text-[#8C775D]"
  }[tone];

  return (
    <div className={`rounded-[24px] border p-4 text-center ${toneClass}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-2 text-3xl font-bold">¥ {amount.toLocaleString("ja-JP")}</div>
      <div className="mt-1 text-sm">({percent}%)</div>
    </div>
  );
}

function EmptyPanel({ body }: { body: string }) {
  return <div className="rounded-[24px] bg-brand-bg px-4 py-8 text-sm leading-7 text-brand-sub">{body}</div>;
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function monthLabel(month: string) {
  const [year, mon] = month.split("-");
  return `${year}年${Number(mon)}月`;
}

function donutBackground(percentages: { cafe: number; travel: number; other: number }) {
  return `conic-gradient(#B7C598 0% ${percentages.cafe}%, #F3A84E ${percentages.cafe}% ${percentages.cafe + percentages.travel}%, #D8DDBD ${percentages.cafe + percentages.travel}% 100%)`;
}

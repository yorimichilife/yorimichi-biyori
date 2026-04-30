"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import type { AccountProfile, ExpenseCategory, ExpenseItem, Note } from "@/lib/types";
import {
  Camera,
  CreditCard,
  Heart,
  MapPin,
  NotebookPen,
  Search,
  Settings2,
  Sparkles,
  Wallet
} from "lucide-react";

type ExpenseOverview = {
  month: string;
  items: ExpenseItem[];
  total: number;
  totals: Record<ExpenseCategory, number>;
};

const art = {
  coffee: "/yorimichi-transparent-assets/asset-003.png",
  cake: "/yorimichi-transparent-assets/asset-004.png",
  bench: "/yorimichi-transparent-assets/asset-005.png",
  sign: "/yorimichi-transparent-assets/asset-006.png",
  shop: "/yorimichi-transparent-assets/asset-017.png",
  branch: "/yorimichi-transparent-assets/asset-013.png",
  branchFlower: "/yorimichi-transparent-assets/asset-045.png",
  mountain: "/yorimichi-transparent-assets/asset-061.png",
  sea: "/yorimichi-transparent-assets/asset-062.png",
  alley: "/yorimichi-transparent-assets/asset-063.png",
  map: "/yorimichi-transparent-assets/asset-064.png",
  diary: "/yorimichi-transparent-assets/asset-065.png",
  flowers: "/yorimichi-transparent-assets/asset-066.png",
  coffeeCup: "/yorimichi-transparent-assets/asset-067.png",
  speech: "/yorimichi-transparent-assets/asset-069.png",
  bubble: "/yorimichi-transparent-assets/asset-070.png",
  sparkle: "/yorimichi-transparent-assets/asset-072.png",
  music: "/yorimichi-transparent-assets/asset-073.png",
  avatarBoy: "/yorimichi-transparent-assets/asset-050.png",
  avatarGirl: "/yorimichi-transparent-assets/asset-051.png",
  avatarBoyCamera: "/yorimichi-transparent-assets/asset-052.png",
  avatarBoyMap: "/yorimichi-transparent-assets/asset-053.png",
  avatarBoyCoffee: "/yorimichi-transparent-assets/asset-054.png",
  avatarGirlCamera: "/yorimichi-transparent-assets/asset-056.png",
  avatarGirlMap: "/yorimichi-transparent-assets/asset-057.png",
  avatarGirlCoffee: "/yorimichi-transparent-assets/asset-058.png",
  dotted: "/yorimichi-transparent-assets/asset-046.png",
  flower: "/yorimichi-transparent-assets/asset-049.png",
  tape: "/yorimichi-transparent-assets/asset-043.png"
} as const;

const badgeItems = [
  { title: "カフェ好き", level: "Lv.2", image: art.coffee },
  { title: "散歩マスター", level: "Lv.1", image: art.bench },
  { title: "日記常連", level: "Lv.3", image: art.diary },
  { title: "旅行好き", level: "Lv.1", image: art.avatarBoyCamera },
  { title: "いいね職人", level: "Lv.2", image: art.speech }
];

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
    const cafe = Math.round((expenseState.totals["カフェ"] / total) * 100);
    const travel = Math.round((expenseState.totals["旅行"] / total) * 100);
    return {
      cafe,
      travel,
      other: Math.max(0, 100 - cafe - travel)
    };
  }, [expenseState]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setProfileState((prev) => ({ ...prev, avatar: result }));
      }
    };
    reader.readAsDataURL(file);
  }

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
        avatar: profileState.avatar
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
    <div className="space-y-5 md:space-y-8">
      <div className="grid gap-4 lg:gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-5 sm:p-6">
          <div className="relative">
            <Image
              src={art.branchFlower}
              alt=""
              width={120}
              height={120}
              className="absolute -left-6 top-8 hidden opacity-90 sm:block"
            />
            <Image
              src={art.flowers}
              alt=""
              width={88}
              height={88}
              className="absolute -right-4 top-24 hidden opacity-90 sm:block"
            />
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-[#EFE6D4] bg-[#FFFDF7] sm:h-32 sm:w-32">
                <Image src={profileState.avatar} alt={profileState.name} fill className="object-cover" />
              </div>
              <a
                href="#account-settings"
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-brand-border bg-white px-4 text-sm font-medium text-brand-text"
              >
                <Settings2 className="h-4 w-4" />
                アカウント設定
              </a>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="font-accent text-[2rem] font-bold text-brand-text sm:text-4xl">{profileState.name}</h1>
              <p className="text-sm text-brand-sub sm:text-base">{profileState.handle}</p>
              <p className="text-sm leading-7 text-brand-sub">
                {profileState.bio}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-y border-brand-border py-4 text-center">
            <StatCell label="投稿した日記" value={ownNotes.length} unit="件" />
            <StatCell label="訪れた場所" value={visitedSpotCount} unit="ヶ所" />
            <StatCell label="いいねした記事" value={likedNotes.length} unit="件" />
          </div>

          <div className="mt-4 rounded-[24px] border border-[#F0E5D5] bg-[#FFFBF0] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-[0.12em] text-[#8C6E4A]">これまでのより道支出合計</div>
                <div className="mt-2 text-3xl font-bold text-brand-text sm:text-4xl">
                  ¥ {allTimeExpenseTotal.toLocaleString("ja-JP")}
                </div>
              </div>
              <Image src={art.flower} alt="" width={44} height={44} className="opacity-90" />
            </div>
          </div>

          <a
            href="#account-settings"
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-brand-border bg-white px-5 text-sm font-medium text-brand-text"
          >
            プロフィールを編集する
          </a>
        </Card>

        <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-5 sm:p-6">
          <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Image src={art.branch} alt="" width={28} height={28} className="opacity-80" />
              <h2 className="font-accent text-[2rem] font-bold text-brand-text sm:text-4xl">最近のより道</h2>
            </div>
            <Link href="/blog" className="text-sm font-medium text-brand-sub">
              すべて見る →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentNotes.map((note, index) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group overflow-hidden rounded-[28px] border border-brand-border bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={note.coverImage} alt={note.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3">
                    <Badge tone={note.style.includes("カフェ") ? "green" : note.style.includes("散歩") ? "yellow" : "blue"}>
                      {note.style[0] || "旅"}
                    </Badge>
                  </div>
                  {index === 0 ? (
                    <Image src={art.coffeeCup} alt="" width={52} height={52} className="absolute bottom-3 right-3 opacity-95" />
                  ) : index === 1 ? (
                    <Image src={art.shop} alt="" width={56} height={56} className="absolute bottom-3 right-3 opacity-95" />
                  ) : (
                    <Image src={art.sea} alt="" width={56} height={56} className="absolute bottom-3 right-3 rounded-2xl opacity-95" />
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="text-xl font-bold leading-tight text-brand-text sm:text-2xl">{note.title}</div>
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
            ))}
          </div>
        </Card>
      </div>

      <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-4 sm:p-6">
        <div className="flex gap-2 overflow-x-auto border-b border-brand-border pb-4">
          {tabs.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-text transition hover:border-[#C7D3AA] hover:bg-[#FAF9EF]"
            >
              {tab.icon}
              {tab.label}
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section id="my-notes" className="space-y-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Image src={art.branch} alt="" width={28} height={28} />
                <h3 className="text-2xl font-bold text-brand-text sm:text-3xl">自分の日記</h3>
              </div>
              <Button href="/notes/new" className="h-11 px-4 text-sm sm:px-5">
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
                ownNotes.slice(0, 4).map((note, index) => (
                  <DiaryListItem key={note.id} note={note} sticker={index === 0 ? art.coffee : index === 1 ? art.sea : index === 2 ? art.sign : art.music} />
                ))
              ) : (
                <EmptyPanel
                  body="まだ日記がありません。最初のよりみちを、ここからやさしく残していきましょう。"
                  image={art.diary}
                />
              )}
            </div>
            <Link href="/notes" className="block rounded-2xl border border-brand-border px-4 py-3 text-center text-sm font-medium text-brand-text">
              すべての日記を見る →
            </Link>
          </section>

          <section id="liked-notes" className="space-y-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-[#D86B55]" />
                <h3 className="text-2xl font-bold text-brand-text sm:text-3xl">いいねした記事</h3>
              </div>
              <Link href="/blog" className="text-sm font-medium text-brand-sub">
                すべて見る →
              </Link>
            </div>

            {likedNotes.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {likedNotes.slice(0, 4).map((note, index) => (
                  <MiniNoteCard key={note.id} note={note} sticker={index % 2 === 0 ? art.cake : art.alley} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                body="まだいいねした記事がありません。みんなのよりみちで、心が動いた一冊を見つけてみましょう。"
                image={art.speech}
              />
            )}
          </section>

          <section id="kakeibo" className="space-y-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#8AA060]" />
                <h3 className="text-2xl font-bold text-brand-text sm:text-3xl">家計簿</h3>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-brand-border bg-white px-3 py-2 text-sm">
                <button onClick={() => moveMonth(-1)} aria-label="前の月">
                  ‹
                </button>
                <span>{monthLabel(expenseState.month)}</span>
                <button onClick={() => moveMonth(1)} aria-label="次の月">
                  ›
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-brand-border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-brand-sub">今月のより道支出合計</div>
                  <div className="mt-3 text-4xl font-bold text-brand-text sm:text-5xl">
                    ¥ {expenseState.total.toLocaleString("ja-JP")}
                  </div>
                </div>
                <Image src={art.coffeeCup} alt="" width={56} height={56} className="opacity-90" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    <EmptyPanel body="まだこの月の支出がありません。下の入力欄から追加できます。" image={art.map} />
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px_320px]">
        <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-end">
            <div className="space-y-4">
              <h3 className="font-accent text-3xl font-bold text-brand-text sm:text-4xl">あなたのより道を、もっと楽しく。</h3>
              <p className="max-w-xl text-sm leading-8 text-brand-sub">
                日記をつけて、思い出を残そう。あなたのペースで、自由により道を楽しんでください。
              </p>
            </div>
            <div className="relative mx-auto h-40 w-40">
              <Image src={art.avatarGirlCoffee} alt="" fill className="object-contain" />
              <Image src={art.branchFlower} alt="" width={80} height={80} className="absolute -left-8 bottom-2 opacity-90" />
            </div>
          </div>
        </Card>

        <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D59A00]" />
              <h3 className="text-2xl font-bold text-brand-text">バッジ</h3>
            </div>
            <Link href="/mypage#liked-notes" className="text-sm text-brand-sub">
              もっと見る →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {badgeItems.map((badge) => (
              <div key={badge.title} className="rounded-[24px] border border-brand-border bg-white p-4 text-center">
                <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-[#FFFDF5]">
                  <Image src={badge.image} alt={badge.title} fill className="object-contain p-2" />
                </div>
                <div className="mt-3 text-sm font-bold text-brand-text">{badge.title}</div>
                <div className="mt-1 text-xs text-brand-sub">{badge.level}</div>
              </div>
            ))}
            <div className="rounded-[24px] border border-dashed border-[#D6CDB8] bg-[#FFFDF7] p-4 text-center">
              <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-[#FFF8EE]">
                <Image src={art.sparkle} alt="バッジを増やす" fill className="object-contain p-4" />
              </div>
              <div className="mt-3 text-sm font-bold text-brand-text">バッジを増やす</div>
            </div>
          </div>
        </Card>

        <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-[#8AA060]" />
              <h3 className="text-2xl font-bold text-brand-text">訪れた場所マップ</h3>
            </div>
            <Link href="/map" className="text-sm text-brand-sub">
              すべて見る →
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[28px] border border-brand-border bg-[#F7F5EA] p-4">
            <div className="relative aspect-square overflow-hidden rounded-[24px]">
              <Image src={art.map} alt="訪れた場所マップ" fill className="object-cover" />
              <Image src={art.sea} alt="" width={84} height={84} className="absolute left-3 top-4 rounded-full border-4 border-white" />
              <Image src={art.alley} alt="" width={84} height={84} className="absolute right-4 top-10 rounded-full border-4 border-white" />
              <Image src={art.mountain} alt="" width={84} height={84} className="absolute left-10 bottom-8 rounded-full border-4 border-white" />
            </div>
          </div>
        </Card>
      </div>

      <section id="account-settings">
        <Card className="paper-panel overflow-hidden border-[#EEE6D7] p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-[#8AA060]" />
            <h3 className="text-2xl font-bold text-brand-text sm:text-3xl">アカウント設定</h3>
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
            <div className="grid gap-3 lg:col-span-2">
              <span className="text-sm font-bold text-brand-text">プロフィールアイコン</span>
              <div className="flex flex-col gap-4 rounded-[24px] border border-brand-border bg-[#FFFDF7] p-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#EFE6D4] bg-white">
                  <Image src={profileState.avatar} alt={profileState.name} fill className="object-cover" />
                </div>
                <div className="space-y-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-3 text-sm font-bold text-brand-text">
                    <Camera className="h-4 w-4" />
                    写真を選ぶ
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  <p className="text-sm leading-7 text-brand-sub">
                    スマホの写真アプリやPCのフォトライブラリから、アイコンにしたい写真を選べます。
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
              <div className="text-sm text-brand-sub">{profileMessage}</div>
              <Button type="submit" disabled={profileSaving}>
                {profileSaving ? "保存中..." : "アカウント設定を保存する"}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <div className="overflow-hidden py-2">
        <div className="mx-auto flex max-w-[900px] items-center justify-center gap-2 opacity-90">
          <Image src={art.avatarBoyMap} alt="" width={72} height={72} className="hidden sm:block" />
          <Image src={art.dotted} alt="" width={220} height={40} className="w-24 sm:w-40 md:w-56" />
          <Image src={art.flower} alt="" width={32} height={32} />
          <Image src={art.dotted} alt="" width={220} height={40} className="w-24 sm:w-40 md:w-56" />
          <Image src={art.avatarGirlCamera} alt="" width={72} height={72} className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-brand-sub sm:text-xs">{label}</div>
      <div className="text-3xl font-bold text-brand-text sm:text-4xl">{value}</div>
      <div className="text-[11px] text-brand-sub sm:text-xs">{unit}</div>
    </div>
  );
}

function DiaryListItem({ note, sticker }: { note: Note; sticker: string }) {
  return (
    <Link href={`/notes/${note.id}`} className="flex gap-3 rounded-[24px] border border-brand-border bg-white p-3 transition hover:bg-[#FFFDF7] sm:gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
        <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(note.style.length ? note.style : ["日常"]).slice(0, 2).map((item) => (
              <Badge key={item} tone="gray">
                {item}
              </Badge>
            ))}
          </div>
          <Image src={sticker} alt="" width={28} height={28} className="opacity-90" />
        </div>
        <div className="line-clamp-2 text-base font-bold leading-tight text-brand-text sm:text-xl">{note.title}</div>
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

function MiniNoteCard({ note, sticker }: { note: Note; sticker: string }) {
  return (
    <Link href={`/notes/${note.id}`} className="overflow-hidden rounded-[24px] border border-brand-border bg-white transition hover:bg-[#FFFDF7]">
      <div className="relative aspect-square overflow-hidden">
        <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
        <Image src={sticker} alt="" width={52} height={52} className="absolute right-2 top-2 rounded-2xl border-4 border-white bg-white/90" />
      </div>
      <div className="space-y-2 p-3">
        <div className="line-clamp-2 text-sm font-bold text-brand-text sm:text-base">{note.title}</div>
        <div className="text-xs text-brand-sub sm:text-sm">{note.prefecture}</div>
        <div className="inline-flex items-center gap-1 text-xs text-[#D86B55] sm:text-sm">
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
    <div className={`rounded-[24px] border p-3 text-center sm:p-4 ${toneClass}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-2 text-2xl font-bold sm:text-3xl">¥ {amount.toLocaleString("ja-JP")}</div>
      <div className="mt-1 text-xs sm:text-sm">({percent}%)</div>
    </div>
  );
}

function EmptyPanel({ body, image }: { body: string; image: string }) {
  return (
    <div className="rounded-[24px] bg-brand-bg px-4 py-6 text-sm leading-7 text-brand-sub">
      <Image src={image} alt="" width={44} height={44} className="mb-3 opacity-90" />
      {body}
    </div>
  );
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

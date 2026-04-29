"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Eye,
  Globe,
  Lock,
  MapPin,
  PenLine,
  Plus,
  Settings2,
  Trash2
} from "lucide-react";
import { Card } from "@/components/ui";
import type { DayRecord, Note, Privacy } from "@/lib/types";

const coverSamples = [
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80"
];

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県"
] as const;

const areaByPrefecture: Record<string, string> = {
  北海道: "北海道・東北",
  青森県: "北海道・東北",
  岩手県: "北海道・東北",
  宮城県: "北海道・東北",
  秋田県: "北海道・東北",
  山形県: "北海道・東北",
  福島県: "北海道・東北",
  茨城県: "関東",
  栃木県: "関東",
  群馬県: "関東",
  埼玉県: "関東",
  千葉県: "関東",
  東京都: "関東",
  神奈川県: "関東",
  新潟県: "中部",
  富山県: "中部",
  石川県: "中部",
  福井県: "中部",
  山梨県: "中部",
  長野県: "中部",
  岐阜県: "中部",
  静岡県: "中部",
  愛知県: "中部",
  三重県: "中部",
  滋賀県: "近畿",
  京都府: "近畿",
  大阪府: "近畿",
  兵庫県: "近畿",
  奈良県: "近畿",
  和歌山県: "近畿",
  鳥取県: "中国・四国",
  島根県: "中国・四国",
  岡山県: "中国・四国",
  広島県: "中国・四国",
  山口県: "中国・四国",
  徳島県: "中国・四国",
  香川県: "中国・四国",
  愛媛県: "中国・四国",
  高知県: "中国・四国",
  福岡県: "九州・沖縄",
  佐賀県: "九州・沖縄",
  長崎県: "九州・沖縄",
  熊本県: "九州・沖縄",
  大分県: "九州・沖縄",
  宮崎県: "九州・沖縄",
  鹿児島県: "九州・沖縄",
  沖縄県: "九州・沖縄"
};

function normalizeThemes(value: string) {
  return value
    .split(/[,\n、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function NewNoteForm({ initialNote }: { initialNote?: Note }) {
  const router = useRouter();
  const isEdit = Boolean(initialNote);
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [startDate, setStartDate] = useState(initialNote?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialNote?.endDate ?? "");
  const [prefecture, setPrefecture] = useState(
    initialNote?.prefecture && prefectures.includes(initialNote.prefecture as (typeof prefectures)[number])
      ? initialNote.prefecture
      : ""
  );
  const [summary, setSummary] = useState(initialNote?.summary ?? "");
  const [status, setStatus] = useState<Privacy>(initialNote?.status ?? "private");
  const [coverImage, setCoverImage] = useState(initialNote?.coverImage || coverSamples[0]);
  const [companions, setCompanions] = useState(initialNote?.companions ?? "");
  const [style, setStyle] = useState(initialNote?.style ?? []);
  const [theme, setTheme] = useState(initialNote?.theme ?? []);
  const [themeInput, setThemeInput] = useState("");
  const [spots, setSpots] = useState<string[]>(initialNote?.spots ?? []);
  const [spotInput, setSpotInput] = useState("");
  const [days, setDays] = useState<DayRecord[]>(initialNote?.days?.length ? initialNote.days : []);
  const [loadingAction, setLoadingAction] = useState<"draft" | "submit" | null>(null);
  const [error, setError] = useState("");

  const pageTitle = useMemo(
    () => (isEdit ? "旅ノートを編集しましょう" : "旅ノートの基本情報を入力しましょう"),
    [isEdit]
  );

  async function submit(nextStatus?: Privacy) {
    const selectedStatus = nextStatus || status;
    setLoadingAction(selectedStatus === "draft" ? "draft" : "submit");
    setError("");

    const area = areaByPrefecture[prefecture] || "";
    const response = await fetch(isEdit ? `/api/notes/${initialNote?.id}` : "/api/notes", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        area,
        prefecture,
        startDate,
        endDate,
        summary,
        companions,
        coverImage,
        style,
        theme,
        status: selectedStatus,
        days,
        spots
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "保存に失敗しました。");
      setLoadingAction(null);
      return;
    }
    router.push(selectedStatus === "draft" ? "/notes" : `/notes/${data.note.id}`);
    router.refresh();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleDayPhotoChange(dayIndex: number, photoIndex: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setDays((prev) =>
        prev.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                photos: day.photos.map((photo, idx) => (idx === photoIndex ? (reader.result as string) : photo))
              }
            : day
        )
      );
    };
    reader.readAsDataURL(file);
  }

  function updateDay(dayIndex: number, patch: Partial<DayRecord>) {
    setDays((prev) => prev.map((day, index) => (index === dayIndex ? { ...day, ...patch } : day)));
  }

  function addSpot() {
    const trimmed = spotInput.trim();
    if (!trimmed) return;
    setSpots((prev) => [...prev, trimmed]);
    setSpotInput("");
  }

  function addThemeValue(value: string) {
    const normalized = normalizeThemes(value);
    if (!normalized.length) return;
    setTheme((prev) => [...new Set([...prev, ...normalized])]);
    setThemeInput("");
  }

  function addDay() {
    setDays((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        date: endDate ? endDate.replaceAll("-", "/") : "",
        title: "",
        body: "",
        photos: []
      }
    ]);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
      <Card className="order-2 h-fit p-4 md:p-6 xl:order-1">
        <div className="mb-4 text-xl font-bold text-brand-text">旅ノートの構成</div>
        <div className="space-y-2">
          {[
            ["基本情報", CheckCircle2, true],
            ["旅のスケジュール", CalendarDays, false],
            ["写真を追加", Camera, false],
            ["訪れた場所", MapPin, false],
            ["メモ・記録", PenLine, false],
            ["まとめ・振り返り", Eye, false],
            ["公開設定", Settings2, false]
          ].map(([label, Icon, active]) => {
            const TypedIcon = Icon as typeof CheckCircle2;
            return (
              <div
                key={label as string}
                className={`flex items-center gap-3 rounded-2xl px-4 py-4 ${active ? "bg-[#FFECA4] font-bold" : "hover:bg-brand-bg"}`}
              >
                <TypedIcon className="h-5 w-5 text-brand-text" />
                <span>{label as string}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="order-1 p-5 md:p-8 xl:order-2">
        <div className="space-y-2">
          <h1 className="font-accent text-3xl font-bold text-brand-text md:text-4xl">{pageTitle}</h1>
          <p className="text-sm leading-7 text-brand-sub md:text-base">
            保存すると一覧や詳細へすぐ反映されます。スマホからでも気軽に残せるよう、必要な項目だけに絞っています。
          </p>
        </div>

        <form
          className="mt-8 grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Field label="旅のタイトル">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="旅のタイトルを入力"
              className="h-14 w-full rounded-2xl border border-brand-border px-4 outline-none"
            />
          </Field>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="旅行開始日">
              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                required
                className="h-14 w-full rounded-2xl border border-brand-border px-4"
              />
            </Field>
            <Field label="旅行終了日">
              <input
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                required
                className="h-14 w-full rounded-2xl border border-brand-border px-4"
              />
            </Field>
          </div>

          <Field label="都道府県">
            <select
              value={prefecture}
              onChange={(event) => setPrefecture(event.target.value)}
              required
              className="h-14 w-full rounded-2xl border border-brand-border px-4"
            >
              <option value="" disabled>
                都道府県を選択
              </option>
              {prefectures.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="旅行スタイル">
            <div className="flex flex-wrap gap-3">
              {["ひとり旅", "観光・街歩き", "カフェ巡り", "家族旅行", "温泉", "自然", "仕事", "散歩"].map((item) => {
                const active = style.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setStyle((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]))
                    }
                    className={`rounded-full border px-4 py-3 text-sm ${
                      active ? "border-[#E7BA00] bg-[#FFF7D5] font-bold" : "border-brand-border bg-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="同行者">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              {["ひとり", "家族", "友人", "カップル", "その他"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCompanions(item)}
                  className={`h-12 rounded-2xl border px-4 text-sm ${
                    companions === item ? "border-[#E7BA00] bg-[#FFF7D5] font-bold" : "border-brand-border"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Field>

          <Field label="旅テーマ">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={themeInput}
                  onChange={(event) => setThemeInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "," || event.key === "、") {
                      event.preventDefault();
                      addThemeValue(themeInput);
                    }
                  }}
                  onBlur={() => {
                    if (themeInput.trim()) addThemeValue(themeInput);
                  }}
                  className="h-12 flex-1 rounded-2xl border border-brand-border px-4"
                  placeholder="例: 神社巡り、朝カフェ、出張"
                />
                <button
                  type="button"
                  onClick={() => addThemeValue(themeInput)}
                  className="rounded-2xl border border-brand-border px-5 text-sm font-bold text-brand-text"
                >
                  タグ化する
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {theme.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTheme((prev) => prev.filter((value) => value !== item))}
                    className="rounded-full bg-[#FFF7D5] px-4 py-2 text-sm font-medium text-brand-text"
                  >
                    #{item} ×
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="旅の一言メモ">
            <textarea
              required
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="この旅で残しておきたいことを書いてみましょう"
              className="min-h-32 w-full rounded-2xl border border-brand-border px-4 py-4 outline-none"
            />
          </Field>

          <Field label="表紙写真">
            <div className="space-y-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[24px]">
                <Image src={coverImage} alt="cover" fill className="object-cover" />
              </div>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-brand-border px-4 py-3 text-sm font-bold text-brand-text">
                <Camera className="h-4 w-4" />
                画像をアップロード
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                {coverSamples.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setCoverImage(sample)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-2xl border ${
                      coverImage === sample ? "border-brand-yellow" : "border-brand-border"
                    }`}
                  >
                    <Image src={sample} alt="sample" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="訪れた場所">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={spotInput}
                  onChange={(event) => setSpotInput(event.target.value)}
                  className="h-12 flex-1 rounded-2xl border border-brand-border px-4"
                  placeholder="例: 奈良公園"
                />
                <button
                  type="button"
                  onClick={addSpot}
                  className="rounded-2xl border border-brand-border px-5 text-sm font-bold text-brand-text"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {spots.map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => setSpots((prev) => prev.filter((item) => item !== spot))}
                    className="rounded-full bg-brand-bg px-4 py-2 text-sm text-brand-text"
                  >
                    {spot} ×
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="旅の記録">
            <div className="space-y-6">
              {days.map((day, dayIndex) => (
                <div key={`${day.day}-${dayIndex}`} className="rounded-[24px] border border-brand-border p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-bold text-brand-sub">旅の記録</div>
                    {days.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDays((prev) =>
                            prev.filter((_, index) => index !== dayIndex).map((item, index) => ({ ...item, day: index + 1 }))
                          )
                        }
                        className="rounded-full p-2 text-brand-sub hover:bg-brand-bg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-4">
                    <input
                      value={day.date}
                      onChange={(event) => updateDay(dayIndex, { date: event.target.value })}
                      className="h-12 rounded-2xl border border-brand-border px-4"
                      placeholder="2026/05/10"
                    />
                    <input
                      value={day.title}
                      onChange={(event) => updateDay(dayIndex, { title: event.target.value })}
                      className="h-12 rounded-2xl border border-brand-border px-4"
                      placeholder="その日のタイトル"
                    />
                    <textarea
                      value={day.body}
                      onChange={(event) => updateDay(dayIndex, { body: event.target.value })}
                      className="min-h-24 rounded-2xl border border-brand-border px-4 py-3"
                      placeholder="その日の出来事やメモ"
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      {day.photos.map((photo, photoIndex) => (
                        <div key={`${photoIndex}-${photo}`} className="space-y-3 rounded-2xl border border-brand-border p-3">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-bg">
                            <Image src={photo} alt={`${day.title || "day"}-${photoIndex}`} fill className="object-cover" />
                          </div>
                          <input
                            value={photo}
                            onChange={(event) =>
                              updateDay(dayIndex, {
                                photos: day.photos.map((item, idx) => (idx === photoIndex ? event.target.value : item))
                              })
                            }
                            className="h-11 w-full rounded-2xl border border-brand-border px-3 text-sm"
                            placeholder="写真URL"
                          />
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-border px-3 py-2 text-xs font-bold text-brand-text">
                            <Camera className="h-3 w-3" />
                            画像を読み込む
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => handleDayPhotoChange(dayIndex, photoIndex, event)}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateDay(dayIndex, { photos: [...day.photos, coverImage] })}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-sm font-bold text-brand-text"
                    >
                      <Plus className="h-4 w-4" />
                      写真を追加
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDay}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-yellow px-5 py-3 text-sm font-bold text-brand-text"
              >
                <Plus className="h-4 w-4" />
                日程を追加
              </button>
            </div>
          </Field>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => void submit("draft")}
              disabled={Boolean(loadingAction)}
              className="h-12 rounded-full border border-brand-border px-6 text-sm font-bold text-brand-text"
            >
              {loadingAction === "draft" ? "保存中..." : "下書きとして保存"}
            </button>
            <button disabled={Boolean(loadingAction)} className="h-14 rounded-full bg-brand-yellow px-10 text-base font-bold text-brand-text">
              {loadingAction === "submit" ? "保存中..." : isEdit ? "旅ノートを更新する" : "旅ノートを作成する"}
            </button>
          </div>
        </form>
      </Card>

      <div className="order-3 space-y-6">
        <Card className="space-y-4 p-6">
          <h3 className="text-2xl font-bold text-brand-text">旅ノートの公開設定</h3>
          {[
            ["private", "非公開", Lock, "自分だけが閲覧できます"],
            ["unlisted", "URL限定公開", Globe, "URLを知っている人だけが閲覧できます"],
            ["public", "全体に公開", Globe, "誰でも閲覧・検索できます"]
          ].map(([value, label, Icon, body]) => {
            const TypedIcon = Icon as typeof Lock;
            const active = status === value;
            return (
              <button
                key={value as string}
                type="button"
                onClick={() => setStatus(value as Privacy)}
                className={`w-full rounded-[24px] border p-4 text-left ${
                  active ? "border-[#F0C100] bg-[#FFF9E5]" : "border-brand-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TypedIcon className="h-5 w-5" />
                  <div className="font-bold text-brand-text">{label as string}</div>
                </div>
                <div className="mt-2 text-sm text-brand-sub">{body as string}</div>
              </button>
            );
          })}
        </Card>
        <Card className="space-y-4 p-6">
          <h3 className="text-2xl font-bold text-brand-text">書き方のヒント</h3>
          <ul className="space-y-4 text-sm leading-7 text-brand-sub">
            <li>都道府県を選ぶと、エリアは自動で整理されます。</li>
            <li>旅テーマは自由に入力するとタグとしてまとまります。</li>
            <li>公開設定は後から共有ページでも変更できます。</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-3">
      <span className="text-lg font-bold text-brand-text">{label}</span>
      {children}
    </label>
  );
}

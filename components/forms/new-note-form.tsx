"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, Camera, CheckCircle2, Eye, Globe, Lock, MapPin, PenLine, Plus, Settings2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import type { DayRecord, Note, Privacy } from "@/lib/types";

const coverSamples = [
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80"
];

export function NewNoteForm({ initialNote }: { initialNote?: Note }) {
  const router = useRouter();
  const isEdit = Boolean(initialNote);
  const [status, setStatus] = useState<Privacy>(initialNote?.status ?? "private");
  const [coverImage, setCoverImage] = useState(initialNote?.coverImage ?? coverSamples[0]);
  const [companions, setCompanions] = useState(initialNote?.companions ?? "");
  const [style, setStyle] = useState(initialNote?.style ?? []);
  const [theme, setTheme] = useState(initialNote?.theme ?? []);
  const [spots, setSpots] = useState<string[]>(initialNote?.spots ?? []);
  const [spotInput, setSpotInput] = useState("");
  const [days, setDays] = useState<DayRecord[]>(
    initialNote?.days?.length
      ? initialNote.days
      : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pageTitle = useMemo(
    () => (isEdit ? "旅ノートを編集しましょう" : "旅ノートの基本情報を入力しましょう"),
    [isEdit]
  );

  async function submit(formData: FormData, nextStatus?: Privacy) {
    setLoading(true);
    setError("");
    const response = await fetch(isEdit ? `/api/notes/${initialNote?.id}` : "/api/notes", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") || ""),
        area: String(formData.get("area") || ""),
        prefecture: String(formData.get("prefecture") || ""),
        startDate: String(formData.get("startDate") || ""),
        endDate: String(formData.get("endDate") || ""),
        summary: String(formData.get("summary") || ""),
        companions,
        coverImage,
        style,
        theme,
        status: nextStatus || status,
        days,
        spots
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "保存に失敗しました。");
      setLoading(false);
      return;
    }
    router.push(`/notes/${data.note.id}`);
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
                photos: day.photos.map((photo, idx) => (idx === photoIndex ? reader.result as string : photo))
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

  function addDay() {
    setDays((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        date: initialNote?.endDate?.replaceAll("-", "/") ?? "",
        title: "",
        body: "",
        photos: []
      }
    ]);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
      <Card className="h-fit p-4 md:p-6">
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
              <div key={label as string} className={`flex items-center gap-3 rounded-2xl px-4 py-4 ${active ? "bg-[#FFECA4] font-bold" : "hover:bg-brand-bg"}`}>
                <TypedIcon className="h-5 w-5 text-brand-text" />
                <span>{label as string}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <div className="space-y-2">
          <h1 className="font-accent text-4xl font-bold text-brand-text">{pageTitle}</h1>
          <p className="text-brand-sub">保存すると SQLite に登録され、一覧や詳細へ即時反映されます。</p>
        </div>
        <form className="mt-8 grid gap-6" action={submit}>
          <Field label="旅のタイトル">
            <input name="title" required defaultValue={initialNote?.title ?? ""} placeholder="旅のタイトルを入力" className="h-14 w-full rounded-2xl border border-brand-border px-4 outline-none" />
          </Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="旅行開始日">
              <input name="startDate" type="date" required defaultValue={initialNote?.startDate ?? ""} className="h-14 w-full rounded-2xl border border-brand-border px-4" />
            </Field>
            <Field label="旅行終了日">
              <input name="endDate" type="date" required defaultValue={initialNote?.endDate ?? ""} className="h-14 w-full rounded-2xl border border-brand-border px-4" />
            </Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="エリア">
              <select name="area" defaultValue={initialNote?.area ?? ""} className="h-14 w-full rounded-2xl border border-brand-border px-4">
                <option value="" disabled>
                  エリアを選択
                </option>
                {["北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="都道府県・地域">
              <input name="prefecture" required defaultValue={initialNote?.prefecture ?? ""} placeholder="都道府県・地域を入力" className="h-14 w-full rounded-2xl border border-brand-border px-4" />
            </Field>
          </div>
          <Field label="旅行スタイル">
            <div className="flex flex-wrap gap-3">
              {["ひとり旅", "観光・街歩き", "カフェ巡り", "家族旅行", "温泉", "自然"].map((item) => {
                const active = style.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStyle((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]))}
                    className={`rounded-full border px-4 py-3 text-sm ${active ? "border-[#E7BA00] bg-[#FFF7D5] font-bold" : "border-brand-border bg-white"}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="同行者">
            <div className="grid gap-3 md:grid-cols-5">
              {["ひとり", "家族", "友人", "カップル", "その他"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCompanions(item)}
                  className={`h-12 rounded-2xl border px-4 text-sm ${companions === item ? "border-[#E7BA00] bg-[#FFF7D5] font-bold" : "border-brand-border"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Field>
          <Field label="旅のテーマ">
            <div className="flex flex-wrap gap-3">
              {["神社・お寺巡り", "カフェ巡り", "歴史探訪", "癒しの旅", "写真旅", "ごはん"].map((item) => {
                const active = theme.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTheme((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]))}
                    className={`rounded-full border px-4 py-3 text-sm ${active ? "border-[#E7BA00] bg-[#FFF7D5] font-bold" : "border-brand-border bg-white"}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="旅の一言メモ">
            <textarea
              name="summary"
              required
              defaultValue={initialNote?.summary ?? ""}
              placeholder="この旅で残しておきたいことを書いてみましょう"
              className="min-h-32 w-full rounded-2xl border border-brand-border px-4 py-4 outline-none"
            />
          </Field>
          <Field label="表紙写真">
            <div className="space-y-4">
              <div className="relative aspect-[16/6] overflow-hidden rounded-[24px]">
                <Image src={coverImage} alt="cover" fill className="object-cover" />
              </div>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-brand-border px-4 py-3 text-sm font-bold text-brand-text">
                <Camera className="h-4 w-4" />
                画像をアップロード
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {coverSamples.map((sample) => (
                  <button key={sample} type="button" onClick={() => setCoverImage(sample)} className={`relative aspect-[4/3] overflow-hidden rounded-2xl border ${coverImage === sample ? "border-brand-yellow" : "border-brand-border"}`}>
                    <Image src={sample} alt="sample" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Field>
          <Field label="訪れた場所">
            <div className="space-y-4">
              <div className="flex gap-3">
                <input value={spotInput} onChange={(e) => setSpotInput(e.target.value)} className="h-12 flex-1 rounded-2xl border border-brand-border px-4" placeholder="例: 奈良公園" />
                <button type="button" onClick={addSpot} className="rounded-2xl border border-brand-border px-5 text-sm font-bold text-brand-text">
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
                    <div className="text-xl font-bold text-brand-text">{day.day}日目</div>
                    {days.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDays((prev) =>
                            prev
                              .filter((_, index) => index !== dayIndex)
                              .map((item, index) => ({ ...item, day: index + 1 }))
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
                      onChange={(e) => updateDay(dayIndex, { date: e.target.value })}
                      className="h-12 rounded-2xl border border-brand-border px-4"
                      placeholder="2024/05/10"
                    />
                    <input
                      value={day.title}
                      onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                      className="h-12 rounded-2xl border border-brand-border px-4"
                      placeholder="その日のタイトル"
                    />
                    <textarea
                      value={day.body}
                      onChange={(e) => updateDay(dayIndex, { body: e.target.value })}
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
                            onChange={(e) =>
                              updateDay(dayIndex, {
                                photos: day.photos.map((item, idx) => (idx === photoIndex ? e.target.value : item))
                              })
                            }
                            className="h-11 w-full rounded-2xl border border-brand-border px-3 text-sm"
                            placeholder="写真URL"
                          />
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-border px-3 py-2 text-xs font-bold text-brand-text">
                            <Camera className="h-3 w-3" />
                            画像を読み込む
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDayPhotoChange(dayIndex, photoIndex, e)} />
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
              type="submit"
              formAction={async (formData) => {
                await submit(formData, "draft");
              }}
              disabled={loading}
              className="h-12 rounded-full border border-brand-border px-6 text-sm font-bold text-brand-text"
            >
              下書きとして保存
            </button>
            <button disabled={loading} className="h-14 rounded-full bg-brand-yellow px-10 text-base font-bold text-brand-text">
              {loading ? "保存中..." : isEdit ? "旅ノートを更新する" : "旅ノートを作成する"}
            </button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
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
                className={`w-full rounded-[24px] border p-4 text-left ${active ? "border-[#F0C100] bg-[#FFF9E5]" : "border-brand-border"}`}
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
            <li>最初はタイトル・期間・一言メモだけでも十分です。</li>
            <li>作成後は共有設定ページから URL 限定公開やコメント可否を変更できます。</li>
            <li>保存したノートはすぐに一覧と詳細ページへ反映されます。</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-3">
      <span className="text-base font-bold text-brand-text">{label}</span>
      {children}
    </label>
  );
}

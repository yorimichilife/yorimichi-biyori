"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPinned, Plus, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";

type ScheduleRow = {
  id: string;
  day: string;
  time: string;
  destination: string;
  memo: string;
};

const storageKey = "yorimichi-shiori";

export function ShioriForm() {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [destination, setDestination] = useState("");
  const [wishPlaces, setWishPlaces] = useState<string[]>([]);
  const [wishInput, setWishInput] = useState("");
  const [schedule, setSchedule] = useState<ScheduleRow[]>([
    { id: crypto.randomUUID(), day: "", time: "", destination: "", memo: "" }
  ]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        title: string;
        dateRange: { start: string; end: string };
        destination: string;
        wishPlaces: string[];
        schedule: ScheduleRow[];
      };
      setTitle(parsed.title ?? "");
      setDateRange(parsed.dateRange ?? { start: "", end: "" });
      setDestination(parsed.destination ?? "");
      setWishPlaces(parsed.wishPlaces ?? []);
      setSchedule(parsed.schedule?.length ? parsed.schedule : [{ id: crypto.randomUUID(), day: "", time: "", destination: "", memo: "" }]);
    } catch {}
  }, []);

  function save() {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        title,
        dateRange,
        destination,
        wishPlaces,
        schedule
      })
    );
    setMessage("しおりを保存しました。");
  }

  function addWishPlace() {
    const trimmed = wishInput.trim();
    if (!trimmed) return;
    setWishPlaces((prev) => [...prev, trimmed]);
    setWishInput("");
  }

  function updateRow(id: string, patch: Partial<ScheduleRow>) {
    setSchedule((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <h1 className="font-accent text-4xl font-bold text-brand-text">旅のしおりを作る</h1>
          <p className="text-sm leading-7 text-brand-sub">
            日程、行き先、行きたい場所、当日の動きをまとめて、よりみち前の計画帳として使えます。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-3">
            <span className="text-base font-bold text-brand-text">しおりタイトル</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 初夏の金沢よりみち旅" className="h-14 rounded-2xl border border-brand-border px-4" />
          </label>
          <label className="grid gap-3">
            <span className="text-base font-bold text-brand-text">主な行き先</span>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="例: 石川県 金沢市" className="h-14 rounded-2xl border border-brand-border px-4" />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-3">
            <span className="text-base font-bold text-brand-text">出発日</span>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))} className="h-14 rounded-2xl border border-brand-border px-4" />
          </label>
          <label className="grid gap-3">
            <span className="text-base font-bold text-brand-text">帰宅日</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))} className="h-14 rounded-2xl border border-brand-border px-4" />
          </label>
        </div>

        <div className="grid gap-3">
          <span className="text-base font-bold text-brand-text">行きたい場所</span>
          <div className="flex gap-3">
            <input value={wishInput} onChange={(e) => setWishInput(e.target.value)} placeholder="例: 21世紀美術館" className="h-12 flex-1 rounded-2xl border border-brand-border px-4" />
            <button type="button" onClick={addWishPlace} className="rounded-2xl bg-brand-yellow px-5 text-sm font-bold text-brand-text">
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wishPlaces.map((item) => (
              <button key={item} type="button" onClick={() => setWishPlaces((prev) => prev.filter((place) => place !== item))} className="rounded-full bg-brand-bg px-4 py-2 text-sm text-brand-text">
                {item} ×
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-brand-text">予定表</span>
            <button
              type="button"
              onClick={() =>
                setSchedule((prev) => [...prev, { id: crypto.randomUUID(), day: "", time: "", destination: "", memo: "" }])
              }
              className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-sm font-bold text-brand-text"
            >
              <Plus className="h-4 w-4" />
              行を追加
            </button>
          </div>

          <div className="space-y-4">
            {schedule.map((row, index) => (
              <div key={row.id} className="grid gap-3 rounded-[24px] border border-brand-border p-4 md:grid-cols-[100px_120px_minmax(0,1fr)_minmax(0,1fr)_40px]">
                <input value={row.day} onChange={(e) => updateRow(row.id, { day: e.target.value })} placeholder={`DAY ${index + 1}`} className="h-11 rounded-2xl border border-brand-border px-3" />
                <input value={row.time} onChange={(e) => updateRow(row.id, { time: e.target.value })} placeholder="09:00" className="h-11 rounded-2xl border border-brand-border px-3" />
                <input value={row.destination} onChange={(e) => updateRow(row.id, { destination: e.target.value })} placeholder="行き先・スポット" className="h-11 rounded-2xl border border-brand-border px-3" />
                <input value={row.memo} onChange={(e) => updateRow(row.id, { memo: e.target.value })} placeholder="メモ" className="h-11 rounded-2xl border border-brand-border px-3" />
                <button type="button" onClick={() => setSchedule((prev) => prev.filter((item) => item.id !== row.id))} className="inline-flex h-11 items-center justify-center rounded-2xl border border-brand-border text-brand-sub">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={save} className="inline-flex h-12 items-center justify-center rounded-full bg-brand-yellow px-6 text-sm font-bold text-brand-text">
            しおりを保存
          </button>
          {message ? <span className="text-sm text-brand-sub">{message}</span> : null}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-bold text-brand-text">しおりでできること</h2>
          <ul className="space-y-3 text-sm leading-7 text-brand-sub">
            <li className="flex gap-2"><CalendarDays className="mt-1 h-4 w-4 shrink-0" />日程ごとに予定を並べて、旅の流れを可視化できます。</li>
            <li className="flex gap-2"><MapPinned className="mt-1 h-4 w-4 shrink-0" />行きたい場所を先にまとめて、旅日記やマップ機能に連動する準備ができます。</li>
            <li className="flex gap-2"><Sparkles className="mt-1 h-4 w-4 shrink-0" />当日の移動やメモを入れて、旅前の不安を減らせます。</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

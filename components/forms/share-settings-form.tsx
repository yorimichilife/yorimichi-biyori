"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import type { Note, Privacy } from "@/lib/types";
import { Globe, Link2, Lock, Mail, MessageCircle, MessageSquareMore, Share2 } from "lucide-react";

export function ShareSettingsForm({ note }: { note: Note }) {
  const [status, setStatus] = useState<Privacy>(note.status);
  const [password, setPassword] = useState(note.share.password);
  const [allowComments, setAllowComments] = useState(note.share.allowComments);
  const [allowDownload, setAllowDownload] = useState(note.share.allowDownload);
  const [expiresAt, setExpiresAt] = useState(note.share.expiresAt ?? "");
  const [message, setMessage] = useState("");

  async function save() {
    setMessage("保存中...");
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        password,
        allowComments,
        allowDownload,
        expiresAt: expiresAt || null
      })
    });
    const data = await response.json();
    setMessage(response.ok ? "共有設定を更新しました。" : data.message || "更新に失敗しました。");
  }

  return (
    <>
      <Card className="p-6 md:p-8">
        <SectionTitle title="旅ノートを共有する" subtitle="家族や友人と旅の思い出を共有できます。" />
        <div className="mt-8 space-y-8">
          <div className="space-y-4">
            <div className="text-lg font-bold text-brand-text">1. 公開範囲を選択</div>
            <div className="grid gap-4 md:grid-cols-3">
              <ShareChoice title="非公開" body="自分のみが閲覧できます" icon={<Lock className="h-7 w-7" />} active={status === "private"} onClick={() => setStatus("private")} />
              <ShareChoice title="URL限定公開" body="URLを知っている人が閲覧できます" icon={<Link2 className="h-7 w-7" />} active={status === "unlisted"} onClick={() => setStatus("unlisted")} />
              <ShareChoice title="全体に公開" body="誰でも閲覧・検索できます" icon={<Globe className="h-7 w-7" />} active={status === "public"} onClick={() => setStatus("public")} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-lg font-bold text-brand-text">2. 共有URL</div>
            <div className="flex flex-col gap-3 md:flex-row">
              <input readOnly value={note.share.shareUrl} className="h-14 flex-1 rounded-2xl border border-brand-border px-4" />
              <button type="button" onClick={() => navigator.clipboard.writeText(note.share.shareUrl)} className="h-14 rounded-2xl border border-brand-border px-6 font-bold text-brand-text">
                コピーする
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-lg font-bold text-brand-text">3. オプション設定</div>
            <OptionRow title="パスワードを設定する" trailing={<input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="未設定" className="rounded-2xl border border-brand-border px-4 py-3" />} />
            <OptionRow title="コメントを許可する" subtitle="閲覧者がコメントを残せるようにします" trailing={<Toggle enabled={allowComments} onClick={() => setAllowComments((prev) => !prev)} />} />
            <OptionRow title="ダウンロードを許可する" subtitle="写真やPDFのダウンロードを許可します" trailing={<Toggle enabled={allowDownload} onClick={() => setAllowDownload((prev) => !prev)} />} />
            <OptionRow title="共有の有効期限を設定する" trailing={<input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="rounded-2xl border border-brand-border px-4 py-3" />} />
          </div>

          <div className="space-y-4">
            <div className="text-lg font-bold text-brand-text">4. 共有リンクを送る</div>
            <div className="flex flex-wrap gap-4">
              <ShareButton icon={<Share2 className="h-6 w-6" />} label="リンクをコピー" onClick={() => navigator.clipboard.writeText(note.share.shareUrl)} />
              <ShareAnchor icon={<MessageCircle className="h-6 w-6 text-[#06C755]" />} label="LINEで送る" href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(note.share.shareUrl)}`} />
              <ShareAnchor icon={<Mail className="h-6 w-6" />} label="メールで送る" href={`mailto:?subject=${encodeURIComponent(note.title)}&body=${encodeURIComponent(note.share.shareUrl)}`} />
              <ShareAnchor icon={<MessageSquareMore className="h-6 w-6 text-[#25D366]" />} label="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`${note.title} ${note.share.shareUrl}`)}`} />
            </div>
          </div>

          {message ? <p className="text-sm text-brand-sub">{message}</p> : null}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="text-2xl font-bold text-brand-text">現在の設定まとめ</div>
        <SummaryRow label="公開範囲" value={<Badge>{status === "private" ? "非公開" : status === "unlisted" ? "URL限定公開" : "全体公開"}</Badge>} />
        <SummaryRow label="URL" value={<span className="text-[#59A33A]">コピー可能</span>} />
        <SummaryRow label="パスワード" value={password ? "設定あり" : "なし"} />
        <SummaryRow label="コメント" value={allowComments ? "許可する" : "許可しない"} />
        <SummaryRow label="ダウンロード" value={allowDownload ? "許可する" : "許可しない"} />
        <SummaryRow label="有効期限" value={expiresAt || "無期限"} />
        <Button className="mt-2 w-full" onClick={save}>
          設定を更新する
        </Button>
      </Card>
    </>
  );
}

function ShareChoice({
  title,
  body,
  icon,
  active,
  onClick
}: {
  title: string;
  body: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`rounded-[24px] border p-5 text-left ${active ? "border-[#F0C100] bg-[#FFF9E5]" : "border-brand-border"}`}>
      <div className="mb-4 text-brand-sub">{icon}</div>
      <div className="text-2xl font-bold text-brand-text">{title}</div>
      <p className="mt-2 text-sm leading-7 text-brand-sub">{body}</p>
    </button>
  );
}

function OptionRow({ title, subtitle, trailing }: { title: string; subtitle?: string; trailing: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-brand-border px-5 py-4">
      <div>
        <div className="font-bold text-brand-text">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-brand-sub">{subtitle}</div> : null}
      </div>
      {trailing}
    </div>
  );
}

function Toggle({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-8 w-14 items-center rounded-full px-1 ${enabled ? "bg-[#7BC25B]" : "bg-[#D8D8D8]"}`}>
      <div className={`h-6 w-6 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : ""}`} />
    </button>
  );
}

function ShareButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid w-24 gap-3 justify-items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-border bg-white shadow-soft">{icon}</div>
      <span className="text-sm text-brand-text">{label}</span>
    </button>
  );
}

function ShareAnchor({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="grid w-24 gap-3 justify-items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-border bg-white shadow-soft">{icon}</div>
      <span className="text-sm text-brand-text">{label}</span>
    </a>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-brand-sub">{label}</span>
      <span className="font-medium text-brand-text">{value}</span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Bookmark, Heart, Link2, Share2 } from "lucide-react";

export function ReactionPanel({
  noteId,
  likes,
  saves,
  shareUrl,
  initialLiked = false,
  initialSaved = false
}: {
  noteId: string;
  likes: number;
  saves: number;
  shareUrl: string;
  initialLiked?: boolean;
  initialSaved?: boolean;
}) {
  const [likeCount, setLikeCount] = useState(likes);
  const [saveCount, setSaveCount] = useState(saves);
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState("");

  async function react(field: "likes" | "saves") {
    setMessage("");
    const response = await fetch(`/api/notes/${noteId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "更新に失敗しました。");
      return;
    }
    if (field === "likes") {
      setLikeCount(data.value);
      setLiked(Boolean(data.active));
    }
    if (field === "saves") {
      setSaveCount(data.value);
      setSaved(Boolean(data.active));
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-4xl bg-brand-border">
      <button onClick={() => react("likes")} className={`space-y-2 px-4 py-6 text-center ${liked ? "bg-[#FFF4F1] text-[#D86B55]" : "bg-white"}`}>
        <Heart className={`mx-auto h-6 w-6 ${liked ? "fill-current" : ""}`} />
        <div className="text-sm font-medium text-brand-text">いいね</div>
        <div className="text-sm text-brand-sub">{likeCount}</div>
      </button>
      <button onClick={() => react("saves")} className={`space-y-2 px-4 py-6 text-center ${saved ? "bg-[#FFF9E9] text-[#C08A00]" : "bg-white"}`}>
        <Bookmark className={`mx-auto h-6 w-6 ${saved ? "fill-current" : ""}`} />
        <div className="text-sm font-medium text-brand-text">保存</div>
        <div className="text-sm text-brand-sub">{saveCount}</div>
      </button>
      <a href={`/notes/${noteId}/share`} className="space-y-2 bg-white px-4 py-6 text-center">
        <Share2 className="mx-auto h-6 w-6" />
        <div className="text-sm font-medium text-brand-text">共有</div>
      </a>
      <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="space-y-2 bg-white px-4 py-6 text-center">
        <Link2 className="mx-auto h-6 w-6" />
        <div className="text-sm font-medium text-brand-text">URLをコピー</div>
      </button>
      </div>
      {message ? <p className="text-center text-xs leading-6 text-brand-sub">{message}</p> : null}
    </div>
  );
}

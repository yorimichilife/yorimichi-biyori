"use client";

import { useState } from "react";
import { Bookmark, Heart, Link2, Share2 } from "lucide-react";

export function ReactionPanel({
  noteId,
  likes,
  saves,
  shareUrl
}: {
  noteId: string;
  likes: number;
  saves: number;
  shareUrl: string;
}) {
  const [likeCount, setLikeCount] = useState(likes);
  const [saveCount, setSaveCount] = useState(saves);

  async function react(field: "likes" | "saves") {
    const response = await fetch(`/api/notes/${noteId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field })
    });
    const data = await response.json();
    if (!response.ok) return;
    if (field === "likes") setLikeCount(data.value);
    if (field === "saves") setSaveCount(data.value);
  }

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-4xl bg-brand-border">
      <button onClick={() => react("likes")} className="space-y-2 bg-white px-4 py-6 text-center">
        <Heart className="mx-auto h-6 w-6" />
        <div className="text-sm font-medium text-brand-text">いいね</div>
        <div className="text-sm text-brand-sub">{likeCount}</div>
      </button>
      <button onClick={() => react("saves")} className="space-y-2 bg-white px-4 py-6 text-center">
        <Bookmark className="mx-auto h-6 w-6" />
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
  );
}

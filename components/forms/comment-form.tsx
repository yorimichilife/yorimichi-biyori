"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentForm({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!body.trim()) return;
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/notes/${noteId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "投稿に失敗しました。");
      setLoading(false);
      return;
    }
    setBody("");
    setMessage("コメントを投稿しました。");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-1 gap-3">
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="h-12 flex-1 rounded-2xl border border-brand-border px-4"
          placeholder="コメントを入力..."
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-2xl bg-brand-yellow px-5 text-sm font-bold text-brand-text"
        >
          {loading ? "送信中..." : "投稿する"}
        </button>
      </div>
      {message ? <p className="text-sm text-brand-sub">{message}</p> : null}
    </div>
  );
}

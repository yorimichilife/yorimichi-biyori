"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function FollowButton({
  followingId,
  initialFollowing
}: {
  followingId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onToggle() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "フォロー操作に失敗しました。");
      setLoading(false);
      return;
    }
    setFollowing(Boolean(data.following));
    setLoading(false);
    window.dispatchEvent(new Event("yorimichi-follow-changed"));
  }

  return (
    <div className="space-y-2">
      <Button variant={following ? "secondary" : "primary"} onClick={onToggle} disabled={loading}>
        {loading ? "更新中..." : following ? "フォロー中" : "フォローする"}
      </Button>
      {message ? <p className="text-xs text-brand-sub">{message}</p> : null}
    </div>
  );
}

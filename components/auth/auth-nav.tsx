"use client";

import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/types";

export function AuthNav() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch("/api/auth", { cache: "no-store" });
      const data = await response.json();
      setUser(data.user ?? null);
    };
    sync();
    window.addEventListener("yorimichi-auth-changed", sync);
    return () => window.removeEventListener("yorimichi-auth-changed", sync);
  }, []);

  if (user) {
    return (
      <Link href="/auth" className="flex items-center gap-2 text-sm font-medium text-brand-text">
        <UserCircle2 className="h-9 w-9 text-[#8B8B8B]" />
        {user.name}
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth" className="text-sm font-medium text-brand-text">
        ログイン
      </Link>
      <Link href="/auth" className="inline-flex h-12 items-center justify-center rounded-full bg-brand-yellow px-5 text-sm font-bold text-brand-text">
        新規登録（無料）
      </Link>
      <UserCircle2 className="h-9 w-9 text-[#8B8B8B]" />
    </>
  );
}

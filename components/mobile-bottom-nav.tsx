"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, House, Search, SquarePlus, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "ホーム", icon: House },
  { href: "/blog", label: "探す", icon: Search },
  { href: "/notes/new", label: "投稿する", icon: SquarePlus, plus: true },
  { href: "/how-it-works", label: "お知らせ", icon: Bell },
  { href: "/mypage", label: "マイページ", icon: UserCircle2 }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[28px] border border-[#EDE6D7] bg-white/95 px-3 py-2 shadow-[0_16px_44px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 items-end gap-1">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-brand-sub transition",
                active && "text-[#7E9461]",
                item.plus && "translate-y-[-12px]"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  item.plus
                    ? "bg-[#AAB98B] text-white shadow-[0_10px_24px_rgba(170,185,139,0.35)]"
                    : active
                      ? "bg-[#F4F7EB] text-[#7E9461]"
                      : "text-brand-text"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

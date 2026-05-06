"use client";

import Link from "next/link";
import { Menu, Search, UserCircle2, X } from "lucide-react";
import { navItems } from "@/lib/data";
import { Button, Container } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthNav } from "@/components/auth/auth-nav";
import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/site-logo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/90 backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <SiteLogo onClick={() => setMenuOpen(false)} />

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-2 text-sm font-medium text-brand-text transition-colors hover:text-black",
                  active && "after:absolute after:bottom-[-18px] after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-brand-yellow"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <label className="flex items-center gap-2 rounded-full border border-brand-border px-3 py-2">
            <Search className="h-4 w-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && router.push(`/blog?q=${encodeURIComponent(search)}`)} className="w-28 bg-transparent text-sm outline-none" placeholder="検索" />
          </label>
          <AuthNav />
        </div>

        <button onClick={() => setMenuOpen((prev) => !prev)} className="rounded-full p-2 lg:hidden" aria-label="メニュー">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {menuOpen ? (
        <div className="border-t border-brand-border bg-white lg:hidden">
          <Container className="space-y-5 py-5">
            <nav className="grid gap-2">
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium text-brand-text",
                      active ? "bg-[#FFF7D5]" : "hover:bg-brand-bg"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/shiori/new"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium text-brand-text",
                  pathname.startsWith("/shiori") ? "bg-[#FFF7D5]" : "hover:bg-brand-bg"
                )}
              >
                しおりを作る
              </Link>
            </nav>

            <label className="flex items-center gap-2 rounded-full border border-brand-border px-4 py-3">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/blog?q=${encodeURIComponent(search)}`);
                    setMenuOpen(false);
                  }
                }}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="みんなのよりみちを検索"
              />
            </label>

            <div className="grid gap-3">
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl border border-brand-border px-4 py-3 text-sm font-medium text-brand-text">
                <UserCircle2 className="h-5 w-5" />
                ログイン / 無料会員登録
              </Link>
              <Link href="/notes/new" className="inline-flex h-12 items-center justify-center rounded-full bg-brand-yellow px-6 text-sm font-bold text-brand-text">
                よりみち日記を書く
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

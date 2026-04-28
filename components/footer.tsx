import { Instagram, MoveUpRight, Twitter, Facebook } from "lucide-react";
import { Container } from "@/components/ui";
import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-border bg-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <SiteLogo size="footer" />
          <p className="max-w-sm text-sm leading-7 text-brand-sub">
            旅の思い出を、日記のように残すサービス。あなたの旅を、あなたらしく。
          </p>
        </div>
        <FooterColumn
          title="サービス"
          items={[
            ["よりみち日記を書く", "/notes/new"],
            ["よりみち日記", "/notes"],
            ["みんなのよりみち", "/blog"],
            ["使い方", "/how-it-works"],
            ["サイトマップ", "/site-map"]
          ]}
        />
        <FooterColumn title="サポート" items={[["よくある質問", "#"], ["お問い合わせ", "#"], ["お知らせ", "#"]]} />
        <FooterColumn title="運営会社" items={[["会社概要", "#"], ["プライバシーポリシー", "#"], ["利用規約", "#"]]} />
        <div className="space-y-4">
          <div className="text-sm font-bold text-brand-text">SNSでつながる</div>
          <div className="flex items-center gap-3">
            {[Instagram, Twitter, Facebook].map((Icon, index) => (
              <button
                key={index}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-text hover:bg-brand-bg"
                aria-label="social"
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </Container>
      <Container className="flex items-center justify-between border-t border-brand-border py-5 text-xs text-brand-sub">
        <span>© Yorimichi Biyori All Rights Reserved.</span>
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border hover:bg-brand-bg">
          <MoveUpRight className="h-4 w-4 rotate-[-45deg]" />
        </button>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  items
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-brand-text">{title}</div>
      <div className="space-y-3 text-sm text-brand-sub">
        {items.map(([label, href]) => (
          <Link key={label} href={href} className="block hover:text-brand-text">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

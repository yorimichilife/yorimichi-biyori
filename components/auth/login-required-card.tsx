import Link from "next/link";
import { Card } from "@/components/ui";

export function LoginRequiredCard({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  return (
    <Card className="mx-auto max-w-2xl space-y-4 p-8 text-center">
      <h1 className="font-accent text-4xl font-bold text-brand-text">{title}</h1>
      <p className="text-sm leading-7 text-brand-sub">{body}</p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/auth" className="inline-flex h-12 items-center justify-center rounded-full bg-brand-yellow px-6 text-sm font-bold text-brand-text">
          ログイン / 無料会員登録
        </Link>
        <Link href="/blog" className="inline-flex h-12 items-center justify-center rounded-full border border-brand-border px-6 text-sm font-bold text-brand-text">
          みんなのよりみちを見る
        </Link>
      </div>
    </Card>
  );
}

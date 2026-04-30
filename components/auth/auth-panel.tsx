"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Button, Card, Container, SectionTitle } from "@/components/ui";
import type { AuthUser } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

type ProviderStatus = {
  credentials: boolean;
  google: boolean;
  x: boolean;
  instagram: boolean;
};

const emptyProviders: ProviderStatus = {
  credentials: true,
  google: false,
  x: false,
  instagram: false
};

export function readStoredUser() {
  return null;
}

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [providers, setProviders] = useState<ProviderStatus>(emptyProviders);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState<null | "login" | "register">(null);

  async function refreshSession() {
    const response = await fetch("/api/auth", { cache: "no-store" });
    const data = await response.json();
    setUser(data.user ?? null);
    setProviders(data.providers ?? emptyProviders);
  }

  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    if (!successState) return;
    const timer = window.setTimeout(() => {
      router.push("/mypage");
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [router, successState]);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage("");

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "");

    if (mode === "register") {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "register",
          name,
          email,
          password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "新規登録に失敗しました。");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (!result || result.error) {
      setMessage(mode === "register" ? "登録後のログインに失敗しました。" : "メールアドレスまたはパスワードが正しくありません。");
      setLoading(false);
      return;
    }

    await refreshSession();
    setMessage(mode === "register" ? "無料会員登録が完了しました。" : "ログインしました。");
    setLoading(false);
    setSuccessState(mode);
    window.dispatchEvent(new Event("yorimichi-auth-changed"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(new FormData(event.currentTarget));
  }

  async function logout() {
    await signOut({ redirect: false });
    await refreshSession();
    setMessage("ログアウトしました。");
    window.dispatchEvent(new Event("yorimichi-auth-changed"));
  }

  async function oauthLogin(provider: "google" | "twitter" | "instagram") {
    setLoading(true);
    await signIn(provider, { callbackUrl: "/mypage" });
  }

  return (
    <Container className="space-y-8 py-12">
      {successState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF5D7] text-[#D59A00] animate-[pulse_1.4s_ease-in-out_infinite]">
              <CheckCircle2 className="h-11 w-11" />
            </div>
            <h2 className="font-accent text-3xl font-bold text-brand-text">
              {successState === "register" ? "会員登録が完了しました" : "ログインできました"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-sub">
              マイページへ移動しています。次のよりみち日記を、ここから育てていきましょう。
            </p>
          </div>
        </div>
      ) : null}
      <SectionTitle
        eyebrow="FREE MEMBERSHIP"
        title="ログイン / 無料会員登録"
        subtitle="記事の閲覧は一部ゲストのまま可能です。旅ノート作成や地図機能の利用には会員登録が必要です。"
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden p-6 md:p-8">
          <div className="relative mb-6 aspect-[16/7] overflow-hidden rounded-[28px] bg-[#FFFDF6]">
            <Image src="/illustrations/card-share.svg" alt="会員登録のイラスト" fill className="object-cover" />
          </div>
          <div className="mb-6 flex gap-3">
            <button onClick={() => setMode("login")} className={`rounded-full px-5 py-3 text-sm font-bold ${mode === "login" ? "bg-brand-yellow text-brand-text" : "border border-brand-border bg-white text-brand-sub"}`}>
              ログイン
            </button>
            <button onClick={() => setMode("register")} className={`rounded-full px-5 py-3 text-sm font-bold ${mode === "register" ? "bg-brand-yellow text-brand-text" : "border border-brand-border bg-white text-brand-sub"}`}>
              無料会員登録
            </button>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <OauthButton enabled={providers.google} onClick={() => oauthLogin("google")} label="Google" description="Googleアカウントで続ける" />
            <OauthButton enabled={providers.x} onClick={() => oauthLogin("twitter")} label="X" description="Xアカウントで続ける" />
            <OauthButton enabled={providers.instagram} onClick={() => oauthLogin("instagram")} label="Instagram" description="Instagramで続ける" />
          </div>
          <p className="mb-6 text-xs leading-6 text-brand-sub">
            Instagram ログインは Meta 側の仕様上、ローカル確認でも HTTPS 環境が必要です。本番ドメインへ配置すると有効化しやすくなります。
          </p>

          <form onSubmit={handleSubmit} className="grid gap-5">
            {mode === "register" ? (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-brand-text">表示名</span>
                <input name="name" required className="h-12 rounded-2xl border border-brand-border px-4" placeholder="旅人の名前" />
              </label>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-text">メールアドレス</span>
              <input name="email" type="email" required className="h-12 rounded-2xl border border-brand-border px-4" placeholder="name@example.com" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-text">パスワード</span>
              <input name="password" type="password" required className="h-12 rounded-2xl border border-brand-border px-4" placeholder="8文字以上" />
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "処理中..." : mode === "login" ? "ログインする" : "無料会員登録する"}
            </Button>
          </form>
          {message ? <p className="mt-4 text-sm text-brand-sub">{message}</p> : null}
        </Card>
        <Card className="space-y-4 overflow-hidden p-6">
          <div className="relative -m-6 mb-0 aspect-[16/11] overflow-hidden bg-[#F7FBFF]">
            <Image src="/illustrations/card-map.svg" alt="会員機能のイラスト" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-brand-text">現在の状態</h2>
          {user ? (
            <>
              <p className="text-sm text-brand-sub">ログイン中: {user.name}</p>
              <p className="text-sm text-brand-sub">{user.email || "メールアドレス未共有"}</p>
              <Button variant="secondary" onClick={logout}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-brand-sub">まだログインしていません。</p>
              <ul className="space-y-2 text-sm leading-7 text-brand-sub">
                <li>みんなのよりみちの閲覧はゲストのまま可能です。</li>
                <li>よりみち日記の作成・編集・共有設定はログインが必要です。</li>
                <li>訪れた場所の記録や地図表示も会員機能として扱います。</li>
              </ul>
            </>
          )}
        </Card>
      </div>
    </Container>
  );
}

function OauthButton({
  enabled,
  onClick,
  label,
  description
}: {
  enabled: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={`rounded-[24px] border p-4 text-left transition ${enabled ? "border-brand-border bg-white hover:border-brand-yellow hover:bg-[#FFFBEA]" : "cursor-not-allowed border-brand-border/70 bg-brand-bg text-brand-sub"}`}
    >
      <div className="relative mb-4 aspect-[16/8] overflow-hidden rounded-[20px] bg-[#FFFDF6]">
        <Image
          src={label === "Google" ? "/illustrations/card-diary.svg" : label === "X" ? "/illustrations/card-route.svg" : "/illustrations/card-photos.svg"}
          alt={`${label} ログインのイラスト`}
          fill
          className="object-cover"
        />
      </div>
      <div className="text-base font-bold text-brand-text">{label}</div>
      <div className="mt-2 text-xs leading-6 text-brand-sub">{enabled ? description : "環境変数を設定すると利用できます"}</div>
    </button>
  );
}

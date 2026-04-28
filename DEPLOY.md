# 一般公開までの手順

## 1. Supabase を作成

1. 新しい Supabase Project を作成
2. SQL Editor で `scripts/supabase-schema.sql` を実行
3. `Project URL` と `service_role key` を控える

## 2. OAuth を作成

必要な callback URL の例:

- Google: `https://あなたのドメイン/api/auth/callback/google`
- X: `https://あなたのドメイン/api/auth/callback/twitter`
- Instagram: `https://あなたのドメイン/api/auth/callback/instagram`

## 3. 環境変数を設定

`.env.example` をもとに、以下を本番環境へ設定します。

- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_X_ID`
- `AUTH_X_SECRET`
- `AUTH_INSTAGRAM_ID`
- `AUTH_INSTAGRAM_SECRET`

## 4. Vercel に配置

1. このプロジェクトを GitHub へ push
2. Vercel で Import
3. 上記環境変数を登録
4. Deploy

## 5. 動作確認

- ゲストでホーム、みんなのよりみちが見られる
- 新規登録できる
- よりみち日記を作成できる
- 位置情報つきマップが表示される
- OAuth ログインが callback 後に戻ってくる

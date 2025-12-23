# 技術スタック

## フロントエンド
- **Next.js**: 16.1.0 (App Router)
- **React**: 19.2.3
- **TypeScript**: ^5
- **Tailwind CSS**: ^4 (PostCSS経由)

## バックエンド・インフラ
- **Supabase**: データベース + 認証
  - `@supabase/supabase-js`: ^2.89.0
  - `@supabase/ssr`: ^0.8.0

## 開発ツール
- **ESLint**: ^9 (eslint-config-next)
- **TypeScript Compiler**: strict mode有効

## その他
- **YouTube埋め込みプレイヤー**: レッスン動画の配信
- **Geist Sans / Geist Mono**: フォント (next/font で最適化)

## TypeScript設定
- Target: ES2017
- Strict mode: 有効
- Path alias: `@/*` → プロジェクトルート
- JSX mode: `react-jsx`

## 環境変数
必須の環境変数（`.env.local`）:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabaseプロジェクトurl
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase公開キー

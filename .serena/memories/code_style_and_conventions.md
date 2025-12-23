# コードスタイルと規約

## TypeScript
- **Strict mode**: 有効
- **型定義**: すべての関数、変数に明示的な型を指定
- **Null チェック**: `strictNullChecks` 有効

## ファイル・ディレクトリ命名
- **コンポーネント**: PascalCase (`CourseCard.tsx`, `UserMenu.tsx`)
- **ユーティリティ**: camelCase (`auth.ts`, `progress.ts`)
- **ページ**: 小文字 (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- **Server Actions**: camelCase (`progress.ts`, `courses.ts`)

## Next.js App Router規約

### Server ComponentsとClient Components
- **デフォルトはServer Component**
- Client Componentには `'use client'` を**ファイルの先頭**に記述
- データフェッチングはServer Componentで実行
- インタラクティブな機能（onClick, useState等）はClient Component

### ファイル命名規則
- `page.tsx`: ルートのUI定義
- `layout.tsx`: 共通レイアウト
- `loading.tsx`: ローディングUI（Suspense境界）
- `error.tsx`: エラーハンドリング（`'use client'` 必須）
- `not-found.tsx`: 404ページ
- `route.ts`: API Route Handler

### ディレクトリ構造
```
app/
├── (routes)/           # ルートファイル
├── _components/        # プライベートフォルダ（ルーティング対象外）
│   ├── ui/            # 再利用可能なUIコンポーネント
│   ├── course/        # 講座関連コンポーネント
│   ├── lesson/        # レッスン関連コンポーネント
│   ├── auth/          # 認証関連コンポーネント
│   ├── admin/         # 管理画面関連コンポーネント
│   └── layout/        # レイアウト関連コンポーネント
└── actions/           # Server Actions
lib/
├── supabase/          # Supabaseクライアント
├── utils/             # ユーティリティ関数
├── types/             # 型定義
└── data/              # データアクセス層
```

## Supabase統合パターン

### クライアント作成
- **Client Component**: `lib/supabase/client.ts` の `createClient()`
- **Server Component/Server Actions**: `lib/supabase/server.ts` の `createClient()`
- **Middleware**: `middleware.ts` で認証トークンリフレッシュ

### 重要な原則
- **RLS（Row Level Security）** を必ず有効化
- Server Componentsはクッキーを直接書き込めない（Middlewareで処理）
- 認証状態は `supabase.auth.getUser()` で取得

## スタイリング
- **Tailwind CSS 4**: ユーティリティファーストCSS
- **グローバルCSS変数**: テーマ管理（`--background`, `--foreground`）
- **ダークモード対応**: `prefers-color-scheme`

## コメント・ドキュメント
- 複雑なロジックには説明コメントを記述
- Server Actions、重要な関数にはJSDocコメント推奨

## ESLint設定
- `eslint-config-next` を使用
- TypeScript向けルール適用
- `.next`, `out`, `build`, `next-env.d.ts` は無視

## 命名規則
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE（グローバル定数）
- **型・インターフェース**: PascalCase
- **プライベートフォルダ**: `_` プレフィックス（例: `_components`）

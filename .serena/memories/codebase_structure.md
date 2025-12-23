# コードベース構造

## ルートディレクトリ
```
e-learning-platform/
├── app/                    # Next.js App Router（メインアプリケーション）
├── lib/                    # ライブラリ・ユーティリティ
├── supabase/              # Supabaseマイグレーション
├── public/                # 静的ファイル
├── docs/                  # ドキュメント
├── .claude/               # Claude Code設定
├── .serena/               # Serena設定
├── middleware.ts          # Next.js Middleware（認証トークンリフレッシュ）
├── package.json           # 依存関係・スクリプト
├── tsconfig.json          # TypeScript設定
├── eslint.config.mjs      # ESLint設定
├── postcss.config.mjs     # PostCSS設定（Tailwind）
├── next.config.ts         # Next.js設定
├── CLAUDE.md              # プロジェクト指示書
└── README.md              # プロジェクト概要
```

## app/ ディレクトリ（Next.js App Router）

### ページルート
```
app/
├── page.tsx                      # トップページ（講座一覧）
├── layout.tsx                    # ルートレイアウト
├── globals.css                   # グローバルCSS
├── favicon.ico                   # ファビコン
│
├── courses/                      # 講座関連
│   ├── page.tsx                 # 講座一覧
│   ├── loading.tsx              # ローディングUI
│   ├── error.tsx                # エラーハンドリング
│   └── [courseId]/              # 動的ルート（講座詳細）
│       ├── page.tsx             # 講座詳細・カリキュラム
│       ├── loading.tsx
│       ├── error.tsx
│       ├── not-found.tsx
│       └── lessons/
│           └── [lessonId]/      # レッスン視聴
│               ├── page.tsx
│               ├── loading.tsx
│               └── error.tsx
│
├── login/                        # ログインページ
│   └── page.tsx
│
├── my-courses/                   # マイページ
│   └── page.tsx
│
├── auth/                         # 認証関連
│   ├── callback/                # OAuth コールバック
│   │   └── route.ts
│   └── auth-code-error/         # 認証エラー
│       └── page.tsx
│
└── admin/                        # 管理画面
    ├── page.tsx                 # ダッシュボード
    ├── layout.tsx               # 管理画面レイアウト
    ├── error.tsx
    ├── courses/
    │   ├── page.tsx             # 講座一覧管理
    │   ├── new/                 # 講座作成
    │   │   └── page.tsx
    │   └── [courseId]/
    │       └── edit/            # 講座編集
    │           └── page.tsx
    ├── categories/              # カテゴリ管理
    │   └── page.tsx
    └── tags/                    # タグ管理
        └── page.tsx
```

### コンポーネント（_components/）
```
app/_components/
├── ui/                          # 汎用UIコンポーネント
│   └── Skeleton.tsx
│
├── course/                      # 講座関連コンポーネント
│   ├── CourseCard.tsx
│   ├── CourseProgress.tsx
│   ├── CourseCurriculumAsync.tsx
│   ├── Curriculum.tsx
│   ├── CategoryFilter.tsx
│   ├── ProgressBar.tsx
│   └── ProgressStats.tsx
│
├── lesson/                      # レッスン関連コンポーネント
│   ├── YouTubePlayer.tsx
│   ├── YouTubePlayerWrapper.tsx
│   ├── CompleteButton.tsx
│   ├── LessonNavigation.tsx
│   └── LessonCurriculumSidebar.tsx
│
├── auth/                        # 認証関連コンポーネント
│   ├── GoogleLoginButton.tsx
│   ├── LogoutButton.tsx
│   └── UserMenu.tsx
│
├── layout/                      # レイアウト関連コンポーネント
│   ├── Header.tsx
│   └── MobileMenuButton.tsx
│
└── admin/                       # 管理画面コンポーネント
    ├── AdminLayoutClient.tsx
    ├── AdminSidebar.tsx
    ├── StatCard.tsx
    ├── CourseForm.tsx
    ├── CourseEditTabs.tsx
    ├── CurriculumEditor.tsx
    ├── SectionForm.tsx
    ├── LessonForm.tsx
    ├── CategoryForm.tsx
    ├── CategoryManager.tsx
    ├── TagForm.tsx
    ├── TagManager.tsx
    └── DeleteCourseButton.tsx
```

### Server Actions（actions/）
```
app/actions/
├── progress.ts                  # 進捗管理アクション
└── admin/
    ├── courses.ts               # 講座管理アクション
    ├── sections.ts              # セクション管理アクション
    ├── lessons.ts               # レッスン管理アクション
    ├── categories.ts            # カテゴリ管理アクション
    └── tags.ts                  # タグ管理アクション
```

## lib/ ディレクトリ

### Supabase クライアント（lib/supabase/）
```
lib/supabase/
├── client.ts                    # Client Component用クライアント
├── server.ts                    # Server Component/Actions用クライアント
└── build-client.ts              # クライアント構築ユーティリティ
```

### データアクセス層（lib/data/）
```
lib/data/
├── courses.ts                   # 講座データアクセス
├── lessons.ts                   # レッスンデータアクセス
├── categories.ts                # カテゴリデータアクセス
└── tags.ts                      # タグデータアクセス
```

### 型定義（lib/types/）
```
lib/types/
├── database.types.ts            # Supabase生成型定義
└── entities.ts                  # エンティティ型定義
```

### ユーティリティ（lib/utils/）
```
lib/utils/
├── auth.ts                      # 認証ユーティリティ
├── progress.ts                  # 進捗計算ユーティリティ
└── errors.ts                    # エラーハンドリング
```

## supabase/ ディレクトリ

### マイグレーション（supabase/migrations/）
```
supabase/migrations/
├── 20231223_enable_rls_policies.sql        # RLSポリシー有効化
├── 20231223_atomic_order_swap.sql          # 順序入れ替えロジック
└── README.md                                # マイグレーション説明
```

## 重要な設定ファイル

### middleware.ts
- 認証トークンの自動リフレッシュ
- 管理画面へのアクセス制御
- すべてのリクエストで `supabase.auth.getUser()` を呼び出し

### 環境変数（.env.local）
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

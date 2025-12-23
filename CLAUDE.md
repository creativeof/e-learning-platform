# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

YouTube動画を活用したUdemyライクな講座プラットフォームのMVP（Minimum Viable Product）。
課金機能は後のフェーズで実装し、まずは基本的な講座配信・視聴・進捗管理機能を実現する。

**技術スタック:**
- Next.js 16.1.0 (App Router) + React 19 + TypeScript
- Supabase (データベース + 認証)
- YouTube埋め込みプレイヤー
- Tailwind CSS 4

## 開発コマンド

```bash
# 開発サーバー起動 (http://localhost:3000)
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint
```

## データ構造（3階層）

```
講座 (Course)
 └─ セクション (Section)
     └─ レッスン (Lesson)
```

### 主要エンティティ

**Course（講座）**: タイトル、説明文、サムネイル、カテゴリ、タグ
**Section（セクション）**: タイトル、説明文、表示順序
**Lesson（レッスン）**: タイトル、説明文、YouTube動画ID、表示順序
**Progress（進捗）**: ユーザーごとのレッスン完了状態
**Category（カテゴリ）**: 講座の分類
**Tag（タグ）**: 講座に付与するタグ（多対多）

## 認証とアクセス制御

### 認証方式
- **Supabase Auth** を使用
- **Google OAuth** のみ実装

### アクセスルール
- **未認証ユーザー**: 各講座の最初のレッスン（1つ目）のみ視聴可能
- **認証済みユーザー**: すべてのレッスンを視聴可能
- **管理者**: `profiles.role = 'admin'` のユーザーのみ管理画面にアクセス可能

## データベーススキーマ（Supabase）

### profiles
```sql
id (uuid, primary key, references auth.users)
display_name (text)
avatar_url (text)
role (text, default 'user')  -- 'user' or 'admin'
created_at, updated_at (timestamp)
```

### courses
```sql
id (uuid, primary key)
title (text)
description (text)
thumbnail_url (text)
category_id (uuid, foreign key → categories)
created_at, updated_at (timestamp)
```

### sections
```sql
id (uuid, primary key)
course_id (uuid, foreign key → courses)
title (text)
description (text)
order (integer)  -- 表示順序
created_at, updated_at (timestamp)
```

### lessons
```sql
id (uuid, primary key)
section_id (uuid, foreign key → sections)
title (text)
description (text)
youtube_video_id (text)  -- YouTube動画ID
order (integer)  -- 表示順序
created_at, updated_at (timestamp)
```

### progress
```sql
id (uuid, primary key)
user_id (uuid, foreign key → auth.users)
lesson_id (uuid, foreign key → lessons)
completed (boolean)
completed_at (timestamp)
created_at (timestamp)
UNIQUE constraint on (user_id, lesson_id)
```

### categories
```sql
id (uuid, primary key)
name (text, unique)
description (text)
created_at (timestamp)
```

### tags
```sql
id (uuid, primary key)
name (text, unique)
created_at (timestamp)
```

### course_tags（中間テーブル）
```sql
course_id (uuid, foreign key → courses)
tag_id (uuid, foreign key → tags)
PRIMARY KEY (course_id, tag_id)
```

## ページ構成とルーティング

### 一般ユーザー向け
- `/` - トップページ（講座一覧）
- `/courses` - 講座一覧
- `/courses/[courseId]` - 講座詳細（カリキュラム、進捗率表示）
- `/courses/[courseId]/lessons/[lessonId]` - レッスン視聴ページ
- `/login` - ログインページ
- `/my-courses` - マイページ（受講中の講座）

### 管理者向け（`/admin/*`）
- `/admin` - ダッシュボード
- `/admin/courses` - 講座一覧管理
- `/admin/courses/new` - 講座作成
- `/admin/courses/[courseId]/edit` - 講座編集
- `/admin/categories` - カテゴリ管理
- `/admin/tags` - タグ管理

## 重要なアーキテクチャパターン

### Supabase統合

**必須パッケージ:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**環境変数設定（`.env.local`）:**
```env
NEXT_PUBLIC_SUPABASE_URL=<Supabaseプロジェクトurl>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase公開キー>
```

**重要な原則:**
- Next.jsのServer Componentsはクッキーを直接書き込めないため、認証トークンのリフレッシュにはMiddlewareレベルのProxyが必要
- Server ComponentとClient Componentで異なるクライアント作成方法を使用
- **RLS（Row Level Security）** を必ず有効化してデータアクセスを制御

#### クライアント作成パターン

**ファイル構造:**
```
lib/
└── supabase/
    ├── client.ts      # Client Component用
    ├── server.ts      # Server Component/Server Actions用
    └── middleware.ts  # Middleware用
```

**1. Client Component用（`lib/supabase/client.ts`）:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**注意:** `createBrowserClient`はシングルトン実装のため、何度呼び出しても単一インスタンスのみ存在します。

**2. Server Component/Server Actions用（`lib/supabase/server.ts`）:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentではクッキー書き込みが失敗する可能性がある
            // Middlewareでトークンリフレッシュを処理するため、ここでは無視
          }
        },
      },
    }
  )
}
```

**重要:** Server Componentsではクッキーを書き込めないため、`setAll`内のエラーは無視します。トークンリフレッシュはMiddlewareで処理されます。

**3. Route Handler用（`app/api/*/route.ts`）:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Route Handlerではクッキーの読み書き両方が可能
  const { data } = await supabase.from('courses').select('*')

  return NextResponse.json(data)
}
```

**4. Middleware用（`middleware.ts`）:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: トークンリフレッシュのためにgetUser()を呼び出す
  // これによりセッションがリフレッシュされ、期限切れを防ぐ
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 管理画面へのアクセス制御
  if (request.nextUrl.pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**重要:** Middlewareで`supabase.auth.getUser()`を呼び出すことで：
1. 期限切れトークンを自動的にリフレッシュ
2. `request.cookies.set()`でServer Componentsにトークンを渡す
3. `response.cookies.set()`でブラウザにリフレッシュ済みトークンを返す

#### 使用例

**Server Component:**
```tsx
// app/courses/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, category:categories(*)')

  return <CourseList courses={courses} />
}
```

**Client Component:**
```tsx
// app/_components/LoginButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export function LoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return <button onClick={handleLogin}>Googleでログイン</button>
}
```

**Server Action:**
```tsx
// app/actions/progress.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
  })

  if (error) throw error

  revalidatePath('/courses/[courseId]')
}
```

### 認証フロー
- ユーザー登録時に自動的に `profiles` レコードを作成（Supabaseトリガー関数）
- セッション管理はSupabaseが自動で行う
- 認証状態は `supabase.auth.getUser()` で取得

### YouTube動画埋め込み
- `youtube_video_id` を使用して `https://www.youtube.com/embed/{video_id}` で埋め込み
- iframe または YouTube Embed API を使用
- 遅延読み込み（lazy loading）を実装

### 進捗管理
- レッスン視聴ページに「完了」ボタンを配置
- ボタンクリックで `progress` テーブルに記録（upsert）
- 講座詳細ページで進捗率を計算して表示（完了レッスン数 / 総レッスン数）

### アクセス制御実装
- 未認証ユーザーが2つ目以降のレッスンにアクセスした場合、ログインページにリダイレクト
- 各コースの最初のレッスンは `order = 0` または各セクションの最初のレッスンを特定

## Next.js App Routerのベストプラクティス

### Server ComponentsとClient Componentsの使い分け

**デフォルトはServer Component:**
- すべてのコンポーネントはデフォルトでServer Component
- データフェッチング、バックエンドリソースへのアクセスはServer Componentで行う
- Supabaseからのデータ取得はServer Componentで実行

**Client Componentが必要な場合:**
- `'use client'` ディレクティブを**ファイルの先頭**に記述
- インタラクティブな機能（onClick, onChange, useStateなど）
- React Hooks（useState, useEffect, useContext など）を使用
- ブラウザAPI（localStorage, window など）を使用
- イベントリスナー

**推奨パターン:**
```tsx
// Server Component（デフォルト）- データフェッチング
async function CoursePage({ params }: { params: { courseId: string } }) {
  const supabase = createServerClient()
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.courseId)
    .single()

  return <CourseDetail course={course} />
}

// Client Component - インタラクティブ機能
'use client'
function CourseDetail({ course }: { course: Course }) {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {/* ... */}
    </div>
  )
}
```

### データフェッチング

**Server Componentでのfetch:**
- `async/await` を直接使用可能
- データはサーバーサイドで取得し、HTMLとして送信
- 認証情報を安全に扱える

```tsx
// app/courses/page.tsx
export default async function CoursesPage() {
  const supabase = createServerClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, category:categories(*)')

  return <CourseList courses={courses} />
}
```

**キャッシング戦略:**
- Next.js 16のデフォルト: fetchはキャッシュされない（App Routerの変更点）
- 必要に応じて `cache: 'force-cache'` または `next: { revalidate: 3600 }` を指定
- `revalidatePath()` または `revalidateTag()` で手動再検証

```tsx
// 静的データ（カテゴリなど）- キャッシュする
const { data } = await supabase.from('categories').select('*')
// キャッシュ設定が必要な場合は fetch オプションで指定

// 動的データ（ユーザー進捗など）- キャッシュしない（デフォルト）
const { data } = await supabase.from('progress').select('*')
```

### ファイル命名規則と特殊ファイル

**必須のファイル:**
- `page.tsx` - ルートのUIを定義（このファイルがないとルートは公開されない）
- `layout.tsx` - 共通レイアウト（子ルートに継承される）

**オプションの特殊ファイル:**
- `loading.tsx` - Suspense境界を自動作成し、ローディングUIを表示
- `error.tsx` - エラーハンドリング（`'use client'` 必須）
- `not-found.tsx` - 404ページ
- `route.ts` - API Route Handler（GET, POST, PUT, DELETEなど）

**ディレクトリ構造例:**
```
app/
├── layout.tsx                    # ルートレイアウト
├── page.tsx                      # トップページ
├── loading.tsx                   # グローバルローディング
├── error.tsx                     # グローバルエラーハンドリング
├── courses/
│   ├── layout.tsx               # 講座セクション共通レイアウト
│   ├── page.tsx                 # 講座一覧
│   ├── loading.tsx              # 講座一覧ローディング
│   └── [courseId]/
│       ├── page.tsx             # 講座詳細
│       ├── loading.tsx          # 講座詳細ローディング
│       ├── error.tsx            # 講座詳細エラー
│       └── lessons/
│           └── [lessonId]/
│               └── page.tsx     # レッスン視聴
└── admin/
    ├── layout.tsx               # 管理画面レイアウト
    └── courses/
        ├── page.tsx
        └── [courseId]/
            └── edit/
                └── page.tsx
```

### Loading UIとSuspense

**loading.tsxの使用:**
```tsx
// app/courses/loading.tsx
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  )
}
```

**Suspenseでの部分的なローディング:**
```tsx
// app/courses/[courseId]/page.tsx
import { Suspense } from 'react'

export default function CoursePage({ params }: { params: { courseId: string } }) {
  return (
    <div>
      <CourseHeader courseId={params.courseId} />
      <Suspense fallback={<SectionsSkeleton />}>
        <CourseSections courseId={params.courseId} />
      </Suspense>
    </div>
  )
}
```

### エラーハンドリング

**error.tsxの実装:**
```tsx
// app/courses/[courseId]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>再試行</button>
    </div>
  )
}
```

### Metadata API

**静的メタデータ:**
```tsx
// app/courses/[courseId]/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '講座詳細',
  description: '講座の詳細ページ',
}
```

**動的メタデータ:**
```tsx
// app/courses/[courseId]/page.tsx
export async function generateMetadata(
  { params }: { params: { courseId: string } }
): Promise<Metadata> {
  const course = await getCourse(params.courseId)

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail_url],
    },
  }
}
```

### Route Handlers（API Routes）

**Server Actionsを優先:**
- フォーム送信やデータ変更にはServer Actionsを使用
- Route Handlersは外部Webhook、サードパーティ統合などに使用

**Route Handler例:**
```tsx
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // 処理...

  return NextResponse.json({ success: true })
}
```

### Server Actions

**フォーム送信とデータ変更はServer Actionsで:**
```tsx
// app/actions/progress.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function markLessonComplete(lessonId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('progress')
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    })

  if (error) throw error

  revalidatePath('/courses/[courseId]')
  return { success: true }
}
```

**Client Componentから使用:**
```tsx
'use client'

import { markLessonComplete } from '@/app/actions/progress'
import { useTransition } from 'react'

export function CompleteButton({ lessonId }: { lessonId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      await markLessonComplete(lessonId)
    })
  }

  return (
    <button onClick={handleComplete} disabled={isPending}>
      {isPending ? '処理中...' : '完了'}
    </button>
  )
}
```

### 動的ルートとパラメータ

**パラメータの取得:**
```tsx
// app/courses/[courseId]/page.tsx
export default async function CoursePage({
  params,
  searchParams,
}: {
  params: { courseId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // params.courseId でアクセス
  // searchParams でクエリパラメータにアクセス
}
```

**generateStaticParams（SSG）:**
```tsx
// 静的生成するパスを事前定義
export async function generateStaticParams() {
  const courses = await getCourses()

  return courses.map((course) => ({
    courseId: course.id,
  }))
}
```

### コンポーネントの配置

**推奨ディレクトリ構造:**
```
app/
├── (routes)/           # ルートファイル
├── _components/        # プライベートフォルダ（ルーティング対象外）
│   ├── ui/            # 再利用可能なUIコンポーネント
│   ├── course/        # 講座関連コンポーネント
│   └── lesson/        # レッスン関連コンポーネント
└── actions/           # Server Actions
lib/
├── supabase/          # Supabaseクライアント
├── utils/             # ユーティリティ関数
└── types/             # 型定義
```

**プライベートフォルダ:**
- `_` で始まるフォルダはルーティング対象外
- `app/_components/` にコンポーネントを配置

### リダイレクトとナビゲーション

**Server Componentでのリダイレクト:**
```tsx
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getUser()

  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  // ...
}
```

**Client Componentでのナビゲーション:**
```tsx
'use client'

import { useRouter } from 'next/navigation'

export function LoginButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/login')}>
      ログイン
    </button>
  )
}
```

### キャッシュ戦略

**revalidatePathとrevalidateTag:**
```tsx
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateCourse(courseId: string, data: any) {
  // データ更新...

  // 特定のパスを再検証
  revalidatePath('/courses')
  revalidatePath(`/courses/${courseId}`)

  // または特定のタグを再検証
  revalidateTag('courses')
}
```

### パフォーマンス最適化

**Image最適化:**
```tsx
import Image from 'next/image'

<Image
  src={course.thumbnail_url}
  alt={course.title}
  width={400}
  height={300}
  className="rounded-lg"
  priority // Above the fold の画像のみ
/>
```

**動的インポート:**
```tsx
import dynamic from 'next/dynamic'

const YouTubePlayer = dynamic(() => import('@/components/YouTubePlayer'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // クライアントサイドのみでレンダリング
})
```

## TypeScript設定

- Strict mode有効
- Path alias: `@/*` → プロジェクトルート
- Target: ES2017
- JSX mode: `react-jsx`

## スタイリング

- Tailwind CSS 4 （PostCSS経由）
- グローバルCSS変数でテーマ管理（`--background`, `--foreground`）
- ダークモード対応（`prefers-color-scheme`）
- Geist Sans / Geist Mono フォント（next/font で最適化）

## MVP範囲外（後のフェーズで実装）

以下の機能はMVPには含めない：
- 課金機能
- コメント機能
- 評価・レビュー機能
- 検索機能
- お気に入り/ブックマーク
- メール通知
- 修了証発行

## 開発の進め方

### フェーズ1: 基盤構築
1. Supabaseプロジェクト作成とDB設計
2. Supabase Auth（Google OAuth）設定
3. Next.jsとSupabaseの統合

### フェーズ2: 一般ユーザー機能
1. 講座一覧・詳細ページ
2. レッスン視聴ページ
3. 進捗管理機能
4. 認証フロー

### フェーズ3: 管理者機能
1. 管理画面の基本構造
2. 講座・セクション・レッスンのCRUD
3. カテゴリ・タグ管理

### フェーズ4: 最終調整
1. レスポンシブ対応確認
2. パフォーマンス最適化
3. デプロイ準備（Vercel）

## 開発時の注意事項

- すべてのデータベース操作でRLSポリシーを考慮する
- 管理者権限チェックは必ずサーバーサイドで行う
- YouTube動画IDの検証を行う（不正なIDによるエラーを防ぐ）
- 進捗データは `(user_id, lesson_id)` の組み合わせでユニーク制約
- Next.jsの `<Image>` コンポーネントを画像表示に使用
- メタデータ（title, description）は各ページで適切に設定

# 009: 管理画面ダッシュボード

## 概要
管理者専用のダッシュボードと基本レイアウトを実装する。

## フェーズ
フェーズ3: 管理者機能

## タスク

### 管理者権限チェック

#### Middlewareでのアクセス制御
- [x] `middleware.ts` で `/admin/*` パスへのアクセスをチェック（チケット003で実装済み）
- [x] ユーザーの `role` が `admin` でない場合はリダイレクト

#### Server Componentでの権限チェック
- [x] `lib/utils/auth.ts` にヘルパー関数を作成

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { user, profile }
}
```

### 管理画面レイアウト

#### 管理画面共通レイアウト
- [x] `app/admin/layout.tsx` を作成
- [x] サイドバーナビゲーション実装
- [ ] ヘッダー（管理画面タイトル、ユーザーメニュー）
- [ ] レスポンシブ対応（モバイルでハンバーガーメニュー）

```typescript
import { requireAdmin } from '@/lib/utils/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

#### サイドバーコンポーネント
- [x] `app/_components/admin/AdminSidebar.tsx` を作成
- [x] ナビゲーションリンク実装
  - [x] ダッシュボード (`/admin`)
  - [x] 講座管理 (`/admin/courses`)
  - [x] カテゴリ管理 (`/admin/categories`)
  - [x] タグ管理 (`/admin/tags`)
  - [x] 一般サイトへ戻る (`/`)
- [x] アクティブリンクのハイライト

### ダッシュボードページ

#### ページ作成
- [x] `app/admin/page.tsx` ファイルを作成
- [x] 管理者権限チェック

#### 統計情報取得
- [x] 講座数を取得
- [x] セクション数を取得
- [x] レッスン数を取得
- [x] カテゴリ数を取得
- [x] タグ数を取得

```typescript
const supabase = await createClient()

const [
  { count: coursesCount },
  { count: sectionsCount },
  { count: lessonsCount },
] = await Promise.all([
  supabase.from('courses').select('*', { count: 'exact', head: true }),
  supabase.from('sections').select('*', { count: 'exact', head: true }),
  supabase.from('lessons').select('*', { count: 'exact', head: true }),
])
```

#### UI実装
- [x] ダッシュボードタイトル
- [x] 統計カード表示（講座数、レッスン数など）
- [ ] 最近の講座一覧（オプション）
- [x] クイックアクションボタン（新規講座作成など）

#### 統計カードコンポーネント
- [x] `app/_components/admin/StatCard.tsx` を作成
- [x] アイコン、タイトル、数値を表示
- [x] グリッドレイアウトで配置

```typescript
export function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  )
}
```

### スタイリング
- [x] 管理画面専用のカラースキーム設定
- [x] Tailwind CSSでスタイリング
- [x] ダークモード対応

### Metadata設定
- [x] ページタイトルを「管理画面 - ダッシュボード」に設定
- [x] robots metaタグで検索エンジンからのインデックスを防ぐ

```typescript
export const metadata = {
  title: '管理画面 - ダッシュボード',
  robots: {
    index: false,
    follow: false,
  },
}
```

## 関連ファイル
- `app/admin/page.tsx`
- `app/admin/layout.tsx`
- `app/_components/admin/AdminSidebar.tsx`
- `app/_components/admin/StatCard.tsx`
- `lib/utils/auth.ts`
- `middleware.ts`

## 参考情報
- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)

## 完了条件
- [x] 管理者のみダッシュボードにアクセスできる
- [x] サイドバーナビゲーションが機能する
- [x] 統計情報が正しく表示される
- [ ] レスポンシブデザインが正しく機能する（モバイルハンバーガーメニューは未実装）
- [x] 一般ユーザーはアクセスできない（リダイレクトされる）

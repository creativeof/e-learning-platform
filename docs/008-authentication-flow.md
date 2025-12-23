# 008: 認証フロー

## 概要
Google OAuthを使用したログイン・ログアウト機能を実装する。

## フェーズ
フェーズ2: 一般ユーザー機能

## タスク

### ログインページ

#### ページ作成
- [x] `app/login/page.tsx` ファイルを作成
- [x] すでにログイン済みの場合はリダイレクト

#### UI実装
- [x] ページタイトル・説明文表示
- [x] Googleログインボタンコンポーネント作成
- [x] ブランディング・デザイン調整

#### ログイン機能
- [x] `app/_components/auth/GoogleLoginButton.tsx` を作成（Client Component）
- [x] `supabase.auth.signInWithOAuth` を実装
- [x] リダイレクトURLを設定

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function GoogleLoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      Googleでログイン
    </button>
  )
}
```

### ログアウト機能

#### ログアウトボタンコンポーネント
- [x] `app/_components/auth/LogoutButton.tsx` を作成（Client Component）
- [x] `supabase.auth.signOut` を実装
- [x] ログアウト後にトップページにリダイレクト

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout}>
      ログアウト
    </button>
  )
}
```

### 認証状態の表示

#### ユーザーメニューコンポーネント
- [x] `app/_components/auth/UserMenu.tsx` を作成
- [x] Server Componentでユーザー情報を取得
- [x] ログイン済み: ユーザー名・アバター・ログアウトボタン表示
- [x] 未ログイン: ログインボタン表示

```typescript
import { createClient } from '@/lib/supabase/server'

export async function UserMenu() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <LoginButton />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex items-center gap-2">
      <span>{profile?.display_name || user.email}</span>
      <LogoutButton />
    </div>
  )
}
```

### ヘッダーナビゲーション

#### ヘッダーコンポーネント
- [x] `app/_components/layout/Header.tsx` を作成
- [x] ロゴ・サイト名表示
- [x] ナビゲーションリンク（講座一覧、マイページ）
- [x] ユーザーメニュー配置
- [x] レスポンシブ対応（モバイルメニュー）

#### レイアウトに追加
- [x] `app/layout.tsx` にヘッダーを追加

```typescript
import Header from '@/app/_components/layout/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### 認証コールバック処理

#### コールバックRoute Handler
- [x] `app/auth/callback/route.ts` が正しく実装されているか確認（チケット003で作成済み）
- [x] エラーハンドリングを追加

#### 認証エラーページ
- [x] `app/auth/auth-code-error/page.tsx` を作成
- [x] エラーメッセージ表示
- [x] 再試行リンク追加

### プロテクテッドルート

#### マイページの保護
- [x] `app/my-courses/page.tsx` で認証チェック
- [x] 未認証の場合はログインページにリダイレクト

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MyCoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ページコンテンツ
}
```

#### レッスンページのアクセス制御
- [x] `app/courses/[courseId]/lessons/[lessonId]/page.tsx` でアクセス制御
- [x] 最初のレッスン以外は認証必須

### セッション管理
- [x] Middlewareでセッションリフレッシュが機能していることを確認（チケット003で実装済み）
- [x] セッション期限切れ時の動作確認

### Metadata設定
- [x] ログインページのメタデータ設定
- [x] OGP設定

## 関連ファイル
- `app/login/page.tsx`
- `app/auth/callback/route.ts`
- `app/auth/auth-code-error/page.tsx`
- `app/_components/auth/GoogleLoginButton.tsx`
- `app/_components/auth/LogoutButton.tsx`
- `app/_components/auth/UserMenu.tsx`
- `app/_components/layout/Header.tsx`
- `middleware.ts`

## 参考情報
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)

## 完了条件
- [x] Googleログインが正しく機能する
- [x] ログアウトが正しく機能する
- [x] ヘッダーにユーザー情報が表示される
- [x] 未認証ユーザーは保護されたページにアクセスできない
- [x] セッションリフレッシュが自動的に行われる
- [x] エラーハンドリングが適切に実装されている

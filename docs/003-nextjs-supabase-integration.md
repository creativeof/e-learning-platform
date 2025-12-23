# 003: Next.jsとSupabaseの統合

## 概要
Next.jsプロジェクトにSupabaseクライアントを統合し、認証とデータアクセスの基盤を構築する。

## フェーズ
フェーズ1: 基盤構築

## タスク

### パッケージインストール
- [x] `@supabase/supabase-js` をインストール
- [x] `@supabase/ssr` をインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 環境変数設定
- [x] `.env.local` ファイルを作成
- [x] `NEXT_PUBLIC_SUPABASE_URL` を設定
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- [x] `.gitignore` に `.env.local` が含まれていることを確認

### Supabaseクライアント作成

#### Client Component用クライアント
- [x] `lib/supabase/client.ts` ファイルを作成
- [x] `createBrowserClient` を使用したクライアント作成関数を実装

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server Component用クライアント
- [x] `lib/supabase/server.ts` ファイルを作成
- [x] `createServerClient` を使用したクライアント作成関数を実装
- [x] クッキーの読み書き処理を実装（Server Componentではクッキー書き込みエラーを無視）

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
          }
        },
      },
    }
  )
}
```

### Middleware実装
- [x] `middleware.ts` ファイルをプロジェクトルートに作成
- [x] Supabaseクライアントを作成
- [x] `supabase.auth.getUser()` でトークンリフレッシュを実装
- [x] クッキーの読み書き処理を実装
- [x] 管理画面へのアクセス制御を追加（role チェック）

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

### 型定義作成
- [x] `lib/types/database.types.ts` ファイルを作成
- [x] Supabase CLIを使用してデータベース型を生成（または手動で作成）
- [x] 主要なエンティティ型（Course, Section, Lesson, Progress など）を定義

### 認証コールバックルート作成
- [x] `app/auth/callback/route.ts` ファイルを作成
- [x] OAuth コールバックを処理するRoute Handlerを実装

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

### 動作確認
- [x] Server Componentでデータ取得をテスト
- [x] Client Componentで認証状態取得をテスト
- [x] Middlewareが正しく動作することを確認
- [x] トークンリフレッシュが自動的に行われることを確認

## 関連ファイル
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `middleware.ts`
- `app/auth/callback/route.ts`
- `.env.local`

## 参考情報
- [Supabase SSR Guide for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 完了条件
- [x] Supabaseクライアントが正しく作成され、Server/Client Componentで使用できる
- [x] Middlewareでトークンリフレッシュが自動的に行われる
- [x] 認証コールバックが正しく処理される
- [x] サンプルデータの取得・表示ができる

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
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // 未認証の場合はログインページにリダイレクト
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ユーザーのロールをJWTメタデータから取得（DB クエリを回避）
    // 認証コールバック時にroleをuser_metadataに保存している
    let role = user.user_metadata?.role

    // フォールバック: JWTにroleがない場合はDBから取得（既存ユーザー対応）
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      role = profile?.role

      // 次回以降の高速化のため、roleをJWTに保存
      if (role) {
        await supabase.auth.updateUser({
          data: { role },
        })
      }
    }

    if (role !== 'admin') {
      // 管理者でない場合はトップページにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

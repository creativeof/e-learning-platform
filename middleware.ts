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

    // ユーザーのロールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      // 管理者でない場合はトップページにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

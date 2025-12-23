import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Googleアカウント情報をprofilesテーブルに保存
      const { user } = data

      // Google OAuthから取得したメタデータ
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

      // profilesテーブルを更新
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: fullName || user.email?.split('@')[0],
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // エラーの場合はエラーページにリダイレクト
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

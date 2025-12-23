import { createClient } from '@supabase/supabase-js'

/**
 * ビルド時（generateStaticParams）専用のSupabaseクライアント
 * cookies()を使わないため、認証なしで公開データのみアクセス可能
 */
export function createBuildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

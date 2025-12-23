import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import GoogleLoginButton from '@/app/_components/auth/GoogleLoginButton'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'アカウントにログインして、すべてのレッスンにアクセスしましょう',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // すでにログイン済みの場合はリダイレクト
  if (user) {
    redirect('/my-courses')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* ロゴ・タイトルエリア */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-50">
              ログイン
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              アカウントにログインして、すべてのレッスンにアクセスしましょう
            </p>
          </div>

          {/* ログインフォーム */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm">
            <GoogleLoginButton />

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                ログインすることで、
                <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                  利用規約
                </Link>
                および
                <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                  プライバシーポリシー
                </Link>
                に同意したものとみなします
              </p>
            </div>
          </div>

          {/* 戻るリンク */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
            >
              ← トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

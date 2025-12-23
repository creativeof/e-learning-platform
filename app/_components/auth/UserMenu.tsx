import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from './LogoutButton'

export default async function UserMenu() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        prefetch={false}
      >
        ログイン
      </Link>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="flex items-center gap-4">
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          prefetch={false}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          管理画面
        </Link>
      )}
      <Link
        href="/my-courses"
        className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 font-medium"
        prefetch={false}
      >
        マイ講座
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name || 'User avatar'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {(profile?.display_name || user.email || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {profile?.display_name || user.email}
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded w-fit">
                管理者
              </span>
            )}
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}

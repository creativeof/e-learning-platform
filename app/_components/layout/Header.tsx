import Link from 'next/link'
import UserMenu from '../auth/UserMenu'
import MobileMenuButton from './MobileMenuButton'

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ・サイト名 */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-gray-50"
              prefetch={false}
            >
              E-Learning
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/courses"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 font-medium"
                prefetch={false}
              >
                講座一覧
              </Link>
            </nav>
          </div>

          {/* 右側メニュー */}
          <div className="flex items-center gap-4">
            {/* ユーザーメニュー */}
            <UserMenu />

            {/* モバイルメニューボタン */}
            <MobileMenuButton />
          </div>
        </div>
      </div>
    </header>
  )
}

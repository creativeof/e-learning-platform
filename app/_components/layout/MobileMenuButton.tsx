'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MobileMenuButton() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* モバイルメニューボタン (44px minimum touch target) */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
        aria-label="メニュー"
      >
        {mobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* モバイルナビゲーション */}
      {mobileMenuOpen && (
        <nav className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 py-4 px-4 shadow-lg z-50">
          <Link
            href="/courses"
            className="block px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-50 font-medium rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            講座一覧
          </Link>
        </nav>
      )}
    </>
  )
}

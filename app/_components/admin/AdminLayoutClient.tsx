'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* モバイル用オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* モバイルヘッダー */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* ページコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

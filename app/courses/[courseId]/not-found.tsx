import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-50">
            講座が見つかりません
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            お探しの講座は存在しないか、削除された可能性があります。
          </p>

          <Link
            href="/courses"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            講座一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

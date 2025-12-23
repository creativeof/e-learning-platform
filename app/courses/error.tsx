'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || '講座の読み込み中にエラーが発生しました'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  )
}

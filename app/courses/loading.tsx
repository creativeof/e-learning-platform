export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse" />

        {/* カテゴリフィルタスケルトン */}
        <div className="flex gap-2 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* 講座カードスケルトン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="flex gap-1">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

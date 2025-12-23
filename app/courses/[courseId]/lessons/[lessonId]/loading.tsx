export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player Skeleton */}
            <div className="mb-6">
              <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>

            {/* Lesson Info Skeleton */}
            <div className="mb-6">
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>

            {/* Navigation Skeleton */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="h-16 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-16 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="px-4 py-3">
                        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

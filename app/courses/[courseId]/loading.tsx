export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header Skeleton */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Thumbnail Skeleton */}
            <div className="md:col-span-1">
              <div className="relative w-full aspect-video rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>

            {/* Course Info Skeleton */}
            <div className="md:col-span-2">
              {/* Title */}
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />

              {/* Category and Tags */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              </div>

              {/* Description */}
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>

              {/* CTA Button */}
              <div className="h-12 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Curriculum Skeleton */}
        <div className="mt-12">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />

          {/* Section Skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                  <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

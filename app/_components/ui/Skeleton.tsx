export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}
    />
  )
}

export function ProgressSkeleton() {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  )
}

export function CurriculumSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="px-4 py-3">
                <Skeleton className="h-4 w-64" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}

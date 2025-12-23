import Link from 'next/link'

interface Lesson {
  id: string
  title: string
}

interface LessonNavigationProps {
  courseId: string
  prevLesson: Lesson | null
  nextLesson: Lesson | null
}

export default function LessonNavigation({
  courseId,
  prevLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
      {/* 前のレッスン */}
      {prevLesson ? (
        <Link
          href={`/courses/${courseId}/lessons/${prevLesson.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
          prefetch={false}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <div className="text-left">
            <div className="text-xs text-gray-500 dark:text-gray-400">前のレッスン</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {prevLesson.title}
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <div className="text-left">
            <div className="text-xs text-gray-400 dark:text-gray-600">前のレッスン</div>
            <div className="text-sm font-medium text-gray-400 dark:text-gray-600">なし</div>
          </div>
        </div>
      )}

      {/* 講座に戻る */}
      <Link
        href={`/courses/${courseId}`}
        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        prefetch={false}
      >
        講座に戻る
      </Link>

      {/* 次のレッスン */}
      {nextLesson ? (
        <Link
          href={`/courses/${courseId}/lessons/${nextLesson.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
          prefetch={true}
        >
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">次のレッスン</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {nextLesson.title}
            </div>
          </div>
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed">
          <div className="text-right">
            <div className="text-xs text-gray-400 dark:text-gray-600">次のレッスン</div>
            <div className="text-sm font-medium text-gray-400 dark:text-gray-600">なし</div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

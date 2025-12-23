import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface LessonCurriculumSidebarProps {
  courseId: string
  currentLessonId: string
  sections: any[]
  firstLessonId: string
}

export default async function LessonCurriculumSidebar({
  courseId,
  currentLessonId,
  sections,
  firstLessonId,
}: LessonCurriculumSidebarProps) {
  const supabase = await createClient()

  // 認証ユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">
          カリキュラム
        </h2>
        <div className="space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {sections.map((section: any) => (
            <div
              key={section.id}
              className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-50">
                  {section.title}
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {section.lessons.map((l: any, index: number) => {
                  const isCurrent = l.id === currentLessonId
                  const isLocked = !user && l.id !== firstLessonId

                  // 現在のレッスンの前後1つだけprefetchを有効化
                  const currentIndex = section.lessons.findIndex((lesson: any) => lesson.id === currentLessonId)
                  const shouldPrefetch = Math.abs(index - currentIndex) <= 1

                  return (
                    <div
                      key={l.id}
                      className={`px-4 py-3 text-sm ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : isLocked
                            ? 'bg-gray-50 dark:bg-gray-900 opacity-60'
                            : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      {isLocked ? (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <span className="truncate">{l.title}</span>
                        </div>
                      ) : (
                        <Link
                          href={`/courses/${courseId}/lessons/${l.id}`}
                          className={`flex items-center gap-2 ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                          prefetch={shouldPrefetch}
                        >
                          {isCurrent && (
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                          <span className="truncate">{l.title}</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

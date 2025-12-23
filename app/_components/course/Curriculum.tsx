'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tables } from '@/lib/types/database.types'

type Section = Tables<'sections'> & {
  lessons: Tables<'lessons'>[]
}

interface CurriculumProps {
  sections: Section[]
  progress: { lesson_id: string; completed: boolean }[]
  courseId: string
  isAuthenticated: boolean
}

export default function Curriculum({
  sections,
  progress,
  courseId,
  isAuthenticated,
}: CurriculumProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  )

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed)
  }

  // 各セクションの最初のレッスンを取得
  const getFirstLessonIndex = (sectionIndex: number) => {
    return sections
      .slice(0, sectionIndex)
      .reduce((sum, section) => sum + section.lessons.length, 0)
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.has(section.id)
        const firstLessonGlobalIndex = getFirstLessonIndex(sectionIndex)

        return (
          <div
            key={section.id}
            className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
          >
            {/* セクションヘッダー */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-50">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {section.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {section.lessons.length}レッスン
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* レッスンリスト */}
            {isExpanded && (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {section.lessons.map((lesson, lessonIndex) => {
                  const globalLessonIndex =
                    firstLessonGlobalIndex + lessonIndex
                  const isCompleted = isLessonCompleted(lesson.id)
                  const isFirstLesson = globalLessonIndex === 0
                  const isLocked = !isAuthenticated && !isFirstLesson

                  return (
                    <div
                      key={lesson.id}
                      className={`px-6 py-4 flex items-center gap-4 ${
                        isLocked
                          ? 'bg-gray-50 dark:bg-gray-900 opacity-60'
                          : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'
                      } transition-colors`}
                    >
                      {/* 完了アイコン */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : isLocked ? (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-400 dark:text-gray-600"
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
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-700" />
                        )}
                      </div>

                      {/* レッスン情報 */}
                      {isLocked ? (
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-50">
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className="flex-1 group"
                        >
                          <p className="font-medium text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {lesson.description}
                            </p>
                          )}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* 未認証ユーザーへのCTA */}
      {!isAuthenticated && sections.length > 0 && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-50">
            すべてのレッスンを視聴するには
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ログインすると、{sections.reduce((sum, s) => sum + s.lessons.length, 0)}
            個すべてのレッスンにアクセスできます
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ログインする
          </Link>
        </div>
      )}
    </div>
  )
}

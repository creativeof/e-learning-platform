'use client'

import { markLessonComplete } from '@/app/actions/progress'
import { useTransition } from 'react'

interface CompleteButtonProps {
  lessonId: string
  courseId: string
  isCompleted: boolean
}

export default function CompleteButton({
  lessonId,
  courseId,
  isCompleted,
}: CompleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await markLessonComplete(lessonId, courseId)
      } catch (error) {
        console.error('完了マークに失敗しました:', error)
      }
    })
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending || isCompleted}
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
        isCompleted
          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default'
          : isPending
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          処理中...
        </span>
      ) : isCompleted ? (
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
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
          完了済み
        </span>
      ) : (
        '完了'
      )}
    </button>
  )
}

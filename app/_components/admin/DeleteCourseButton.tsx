'use client'

import { deleteCourse } from '@/app/actions/admin/courses'
import { useState, useTransition } from 'react'

interface DeleteCourseButtonProps {
  courseId: string
  courseTitle: string
}

export default function DeleteCourseButton({
  courseId,
  courseTitle,
}: DeleteCourseButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCourse(courseId)
        setIsConfirmOpen(false)
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除に失敗しました')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
      >
        削除
      </button>

      {/* 確認ダイアログ */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">
              講座を削除しますか？
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              「{courseTitle}」を削除します。この操作は取り消せません。
              関連するセクション、レッスン、進捗データもすべて削除されます。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPending}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isPending ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

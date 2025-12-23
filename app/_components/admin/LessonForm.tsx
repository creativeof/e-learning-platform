'use client'

import { createLesson, updateLesson } from '@/app/actions/admin/lessons'
import { useState, useTransition } from 'react'

interface Lesson {
  id: string
  title: string
  description: string | null
  youtube_video_id: string
}

interface LessonFormProps {
  sectionId: string
  lesson?: Lesson
  onCancel: () => void
  onSuccess?: () => void
}

export default function LessonForm({
  sectionId,
  lesson,
  onCancel,
  onSuccess,
}: LessonFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState(lesson?.youtube_video_id || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (lesson) {
          await updateLesson(lesson.id, formData)
        } else {
          await createLesson(sectionId, formData)
        }
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          レッスンタイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={lesson?.title}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="レッスンのタイトルを入力"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          レッスン説明
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={lesson?.description || ''}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="レッスンの説明を入力"
        />
      </div>

      <div>
        <label
          htmlFor="youtube_video_id"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          YouTube動画ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="youtube_video_id"
          name="youtube_video_id"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          required
          pattern="[a-zA-Z0-9_-]{11}"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="dQw4w9WgXcQ"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          YouTubeのURL (https://www.youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>) から11文字のIDを入力
        </p>
      </div>

      {/* YouTube プレビュー */}
      {videoId && videoId.length === 11 && (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            プレビュー
          </p>
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isPending ? '処理中...' : lesson ? '更新' : '作成'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-lg text-sm font-medium transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}

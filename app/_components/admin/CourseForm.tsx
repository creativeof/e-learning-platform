'use client'

import { createCourse, updateCourse } from '@/app/actions/admin/courses'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  category_id: string | null
}

interface CourseFormProps {
  categories: Category[]
  tags: Tag[]
  course?: Course
  selectedTagIds?: string[]
}

export default function CourseForm({
  categories,
  tags,
  course,
  selectedTagIds = [],
}: CourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (course) {
          await updateCourse(course.id, formData)
        } else {
          await createCourse(formData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* タイトル */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          講座タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={course?.title}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="講座のタイトルを入力"
        />
      </div>

      {/* 説明文 */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          講座説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={course?.description}
          required
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="講座の詳しい説明を入力"
        />
      </div>

      {/* サムネイルURL */}
      <div>
        <label
          htmlFor="thumbnail_url"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          サムネイルURL
        </label>
        <input
          type="url"
          id="thumbnail_url"
          name="thumbnail_url"
          defaultValue={course?.thumbnail_url || ''}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          講座のサムネイル画像のURLを入力してください
        </p>
      </div>

      {/* カテゴリ */}
      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={course?.category_id || ''}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">カテゴリを選択</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          タグ
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="tags"
                value={tag.id}
                defaultChecked={selectedTagIds.includes(tag.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-gray-50">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {isPending ? '処理中...' : course ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-6 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-lg font-medium transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}

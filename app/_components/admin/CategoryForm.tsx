'use client'

import { createCategory, updateCategory } from '@/app/actions/admin/categories'
import { useState, useTransition } from 'react'

interface Category {
  id: string
  name: string
  description: string | null
}

interface CategoryFormProps {
  category?: Category
  onCancel: () => void
  onSuccess?: () => void
}

export default function CategoryForm({
  category,
  onCancel,
  onSuccess,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (category) {
          await updateCategory(category.id, formData)
        } else {
          await createCategory(formData)
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
          htmlFor="name"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          カテゴリ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={category?.name}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="カテゴリ名を入力"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
        >
          説明文
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={category?.description || ''}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="カテゴリの説明を入力"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isPending ? '処理中...' : category ? '更新' : '作成'}
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

'use client'

import { createTag, updateTag } from '@/app/actions/admin/tags'
import { useState, useTransition } from 'react'

interface Tag {
  id: string
  name: string
}

interface TagFormProps {
  tag?: Tag
  onCancel: () => void
  onSuccess?: () => void
}

export default function TagForm({ tag, onCancel, onSuccess }: TagFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (tag) {
          await updateTag(tag.id, formData)
        } else {
          await createTag(formData)
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
          タグ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={tag?.name}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="タグ名を入力"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isPending ? '処理中...' : tag ? '更新' : '作成'}
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

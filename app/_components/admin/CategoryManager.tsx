'use client'

import { deleteCategory } from '@/app/actions/admin/categories'
import CategoryForm from './CategoryForm'
import { useState, useTransition } from 'react'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  courses: { count: number }[]
}

interface CategoryManagerProps {
  categories: Category[]
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (category: Category) => {
    const courseCount = category.courses?.[0]?.count || 0

    if (courseCount > 0) {
      alert(
        `このカテゴリに紐づく講座が${courseCount}件存在するため削除できません。\n先に講座のカテゴリを変更してください。`
      )
      return
    }

    if (!confirm(`「${category.name}」を削除しますか？`)) return

    startTransition(async () => {
      try {
        await deleteCategory(category.id)
      } catch (error) {
        alert(error instanceof Error ? error.message : '削除に失敗しました')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 新規作成ボタン */}
      <div className="flex justify-end">
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規カテゴリ作成
          </button>
        )}
      </div>

      {/* 新規作成フォーム */}
      {showNewForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4">
            新規カテゴリ
          </h2>
          <CategoryForm
            onCancel={() => setShowNewForm(false)}
            onSuccess={() => setShowNewForm(false)}
          />
        </div>
      )}

      {/* カテゴリ一覧 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              まだカテゴリがありません
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              最初のカテゴリを作成する
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    カテゴリ名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    説明
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    講座数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td colSpan={5} className="p-0">
                      {editingId === category.id ? (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                          <CategoryForm
                            category={category}
                            onCancel={() => setEditingId(null)}
                            onSuccess={() => setEditingId(null)}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-6 py-4 items-center">
                          <div className="font-medium text-gray-900 dark:text-gray-50">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description || '-'}
                          </div>
                          <div className="text-sm text-gray-900 dark:text-gray-50 text-center">
                            {category.courses?.[0]?.count || 0}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(category.created_at).toLocaleDateString('ja-JP')}
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingId(category.id)}
                              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-lg transition-colors"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              disabled={isPending}
                              className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

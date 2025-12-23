'use client'

import { deleteTag } from '@/app/actions/admin/tags'
import TagForm from './TagForm'
import { useState, useTransition } from 'react'

interface Tag {
  id: string
  name: string
  created_at: string
  course_tags: { count: number }[]
}

interface TagManagerProps {
  tags: Tag[]
}

export default function TagManager({ tags }: TagManagerProps) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (tag: Tag) => {
    const courseCount = tag.course_tags?.[0]?.count || 0

    const message =
      courseCount > 0
        ? `「${tag.name}」を削除しますか？\n${courseCount}件の講座からこのタグが削除されます。`
        : `「${tag.name}」を削除しますか？`

    if (!confirm(message)) return

    startTransition(async () => {
      try {
        await deleteTag(tag.id)
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
            新規タグ作成
          </button>
        )}
      </div>

      {/* 新規作成フォーム */}
      {showNewForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4">
            新規タグ
          </h2>
          <TagForm
            onCancel={() => setShowNewForm(false)}
            onSuccess={() => setShowNewForm(false)}
          />
        </div>
      )}

      {/* タグ一覧 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {tags.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">まだタグがありません</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              最初のタグを作成する
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    タグ名
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
                {tags.map((tag) => (
                  <tr key={tag.id}>
                    <td colSpan={4} className="p-0">
                      {editingId === tag.id ? (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                          <TagForm
                            tag={tag}
                            onCancel={() => setEditingId(null)}
                            onSuccess={() => setEditingId(null)}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-[2fr_auto_auto_auto] gap-4 px-6 py-4 items-center">
                          <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                              {tag.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 dark:text-gray-50 text-center">
                            {tag.course_tags?.[0]?.count || 0}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(tag.created_at).toLocaleDateString('ja-JP')}
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingId(tag.id)}
                              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-lg transition-colors"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(tag)}
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

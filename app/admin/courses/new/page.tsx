import { requireAdmin } from '@/lib/utils/auth'
import { getCategories } from '@/lib/data/categories'
import { getTags } from '@/lib/data/tags'
import { Metadata } from 'next'
import CourseForm from '@/app/_components/admin/CourseForm'

export const metadata: Metadata = {
  title: '新規講座作成',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function NewCoursePage() {
  await requireAdmin()

  // カテゴリとタグを取得（キャッシュから）
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">新規講座作成</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          新しい講座を作成します
        </p>
      </div>

      {/* フォーム */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <CourseForm categories={categories} tags={tags} />
      </div>
    </div>
  )
}

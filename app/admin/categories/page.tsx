import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { Metadata } from 'next'
import CategoryManager from '@/app/_components/admin/CategoryManager'

export const metadata: Metadata = {
  title: 'カテゴリ管理',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function CategoriesPage() {
  await requireAdmin()

  const supabase = await createClient()

  // カテゴリと講座数を取得
  const { data: categories } = await supabase
    .from('categories')
    .select(
      `
      *,
      courses(count)
    `
    )
    .order('name')

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">カテゴリ管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          講座のカテゴリを管理します
        </p>
      </div>

      {/* カテゴリ管理コンポーネント */}
      <CategoryManager categories={categories || []} />
    </div>
  )
}

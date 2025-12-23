import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { Metadata } from 'next'
import TagManager from '@/app/_components/admin/TagManager'

export const metadata: Metadata = {
  title: 'タグ管理',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function TagsPage() {
  await requireAdmin()

  const supabase = await createClient()

  // タグと講座数を取得
  const { data: tags } = await supabase
    .from('tags')
    .select(
      `
      *,
      course_tags(count)
    `
    )
    .order('name')

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">タグ管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          講座のタグを管理します
        </p>
      </div>

      {/* タグ管理コンポーネント */}
      <TagManager tags={tags || []} />
    </div>
  )
}

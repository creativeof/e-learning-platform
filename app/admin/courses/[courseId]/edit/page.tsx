import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { getCategories } from '@/lib/data/categories'
import { getTags } from '@/lib/data/tags'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CourseEditTabs from '@/app/_components/admin/CourseEditTabs'

export const metadata: Metadata = {
  title: '講座編集',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  await requireAdmin()

  const { courseId } = await params
  const supabase = await createClient()

  // 講座データ、カテゴリ、タグ、セクション・レッスンを並列取得
  const [{ data: course }, categories, tags, { data: sections }] =
    await Promise.all([
      supabase
        .from('courses')
        .select(
          `
          *,
          course_tags(tag_id)
        `
        )
        .eq('id', courseId)
        .single(),
      getCategories(), // キャッシュから取得
      getTags(),       // キャッシュから取得
      supabase
        .from('sections')
        .select(
          `
          *,
          lessons(*)
        `
        )
        .eq('course_id', courseId)
        .order('"order"'),
    ])

  if (!course) {
    notFound()
  }

  // 選択されているタグIDを抽出
  const selectedTagIds = (course.course_tags as any)?.map((ct: any) => ct.tag_id) || []

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">講座編集</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          講座情報とカリキュラムを編集します
        </p>
      </div>

      {/* タブUI */}
      <CourseEditTabs
        course={course}
        categories={categories}
        tags={tags}
        selectedTagIds={selectedTagIds}
        sections={sections || []}
      />
    </div>
  )
}

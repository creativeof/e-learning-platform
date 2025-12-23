import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/data/categories'
import { Metadata } from 'next'
import CourseCard from '../_components/course/CourseCard'
import CategoryFilter from '../_components/course/CategoryFilter'

export const metadata: Metadata = {
  title: '講座一覧',
  description: 'すべての講座を閲覧できます。カテゴリやタグでフィルタリングして、あなたに最適な講座を見つけましょう。',
}

// 30分ごとに再検証（講座一覧は頻繁に更新される可能性がある）
export const revalidate = 1800

interface PageProps {
  searchParams: Promise<{
    category?: string
    tag?: string
  }>
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  // クエリを構築
  let coursesQuery = supabase
    .from('courses')
    .select(`
      *,
      category:categories(*),
      course_tags(tag:tags(*))
    `)

  // カテゴリフィルタ
  if (params.category) {
    coursesQuery = coursesQuery.eq('category_id', params.category)
  }

  // タグフィルタ（course_tagsを経由）
  if (params.tag) {
    coursesQuery = coursesQuery.eq('course_tags.tag_id', params.tag)
  }

  // カテゴリとコースを並列取得（カテゴリはキャッシュから）
  const [categories, { data: courses }] = await Promise.all([
    getCategories(), // キャッシュされた関数を使用
    coursesQuery.order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-50">
          講座一覧
        </h1>

        {/* カテゴリフィルタ */}
        <CategoryFilter
          categories={categories}
          selectedCategory={params.category}
        />

        {/* 講座グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {courses && courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseCard key={course.id} course={course} priority={index < 3} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                講座が見つかりませんでした
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

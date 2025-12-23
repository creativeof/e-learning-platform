import { createClient } from '@/lib/supabase/server'
import { createBuildClient } from '@/lib/supabase/build-client'
import { getCourse, getCourseMetadata } from '@/lib/data/courses'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import CourseProgress from '@/app/_components/course/CourseProgress'
import CourseCurriculumAsync from '@/app/_components/course/CourseCurriculumAsync'
import { ProgressSkeleton, CurriculumSkeleton } from '@/app/_components/ui/Skeleton'

interface PageProps {
  params: Promise<{
    courseId: string
  }>
}

// 静的生成するページのパスを生成
export async function generateStaticParams() {
  const supabase = createBuildClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .limit(100) // ビルド時間を考慮して制限

  return courses?.map((course) => ({
    courseId: course.id,
  })) || []
}

// 1時間ごとに再検証（ISR）
export const revalidate = 3600

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params
  const course = await getCourseMetadata(courseId)

  if (!course) {
    return {
      title: '講座が見つかりません',
    }
  }

  return {
    title: course.title,
    description: course.description || undefined,
    openGraph: {
      title: course.title,
      description: course.description || undefined,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  // 講座データを取得（キャッシュされた関数を使用）
  const { course, error } = await getCourse(courseId)

  if (error || !course) {
    notFound()
  }

  // セクションをorder順にソート
  const sortedSections = course.sections
    ?.sort((a: any, b: any) => a.order - b.order)
    .map((section: any) => ({
      ...section,
      lessons: section.lessons?.sort((a: any, b: any) => a.order - b.order) || [],
    })) || []

  // 最初のレッスンを取得
  const firstLesson = sortedSections[0]?.lessons[0]

  // 認証状態を確認（軽量）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* 講座ヘッダー */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* サムネイル */}
            <div className="md:col-span-1">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                    画像なし
                  </div>
                )}
              </div>
            </div>

            {/* 講座情報 */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50">
                {course.title}
              </h1>

              {/* カテゴリとタグ */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.category && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {course.category.name}
                  </span>
                )}
                {course.course_tags?.map((ct: any, index: number) =>
                  ct.tag ? (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {ct.tag.name}
                    </span>
                  ) : null
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {course.description}
              </p>

              {/* 進捗表示（認証ユーザーのみ） */}
              <Suspense fallback={<ProgressSkeleton />}>
                <CourseProgress courseId={courseId} sections={sortedSections} />
              </Suspense>

              {/* CTAボタン */}
              {firstLesson && (
                <Link
                  href={`/courses/${courseId}/lessons/${firstLesson.id}`}
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {user ? '学習を続ける' : '学習を始める'}
                </Link>
              )}

              {/* 未認証ユーザーへのメッセージ */}
              {!user && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  ログインすると、すべてのレッスンを視聴できます
                </p>
              )}
            </div>
          </div>
        </div>

        {/* カリキュラム */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-50">
            カリキュラム
          </h2>
          <Suspense fallback={<CurriculumSkeleton />}>
            <CourseCurriculumAsync courseId={courseId} sections={sortedSections} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

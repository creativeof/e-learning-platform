import { createClient } from '@/lib/supabase/server'
import { createBuildClient } from '@/lib/supabase/build-client'
import { getLesson, getLessonMetadata } from '@/lib/data/lessons'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import CompleteButton from '@/app/_components/lesson/CompleteButton'
import LessonNavigation from '@/app/_components/lesson/LessonNavigation'
import YouTubePlayerWrapper from '@/app/_components/lesson/YouTubePlayerWrapper'
import LessonCurriculumSidebar from '@/app/_components/lesson/LessonCurriculumSidebar'
import { CurriculumSkeleton } from '@/app/_components/ui/Skeleton'

interface PageProps {
  params: Promise<{
    courseId: string
    lessonId: string
  }>
}

// 静的生成するページのパスを生成
export async function generateStaticParams() {
  const supabase = createBuildClient()

  // すべてのレッスンを取得（セクション経由で講座IDも取得）
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, section:sections(course_id)')
    .limit(500) // ビルド時間を考慮して制限

  return lessons?.map((lesson: any) => ({
    courseId: lesson.section?.course_id,
    lessonId: lesson.id,
  })).filter((param) => param.courseId) || []
}

// 30分ごとに再検証（レッスンは講座より更新頻度が高い可能性がある）
export const revalidate = 1800

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params
  const lesson = await getLessonMetadata(lessonId)

  if (!lesson) {
    return {
      title: 'レッスンが見つかりません',
    }
  }

  return {
    title: lesson.title,
    description: lesson.description || undefined,
  }
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  // レッスンデータを取得（キャッシュされた関数を使用）
  const { lesson, error } = await getLesson(lessonId)

  if (error || !lesson) {
    notFound()
  }

  // 認証ユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 講座の全セクションを取得して、最初のレッスンかどうかを判定
  const { data: allSections } = await supabase
    .from('sections')
    .select('*, lessons(*)')
    .eq('course_id', courseId)
    .order('"order"', { ascending: true })

  const sortedSections =
    allSections
      ?.sort((a: any, b: any) => a.order - b.order)
      .map((section: any) => ({
        ...section,
        lessons: section.lessons?.sort((a: any, b: any) => a.order - b.order) || [],
      })) || []

  // 講座全体の最初のレッスンのIDを取得
  const firstLessonId = sortedSections[0]?.lessons[0]?.id

  // アクセス制御: 未認証ユーザーは最初のレッスンのみ視聴可能
  const isFirstLesson = lessonId === firstLessonId
  if (!user && !isFirstLesson) {
    redirect('/login')
  }

  // 認証ユーザーの進捗データを取得
  let isCompleted = false
  if (user) {
    const { data: progress } = await supabase
      .from('progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    isCompleted = progress?.completed || false
  }

  // 現在のセクション内のレッスンをソート
  const currentSectionLessons =
    lesson.section.lessons?.sort((a: any, b: any) => a.order - b.order) || []

  // 前後のレッスンを取得
  const currentLessonIndex = currentSectionLessons.findIndex((l: any) => l.id === lessonId)
  const prevLesson = currentLessonIndex > 0 ? currentSectionLessons[currentLessonIndex - 1] : null
  const nextLesson =
    currentLessonIndex < currentSectionLessons.length - 1
      ? currentSectionLessons[currentLessonIndex + 1]
      : null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* パンくずリスト */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/courses"
                className="hover:text-blue-600 dark:hover:text-blue-400"
                prefetch={false}
              >
                講座一覧
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/courses/${courseId}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
                prefetch={false}
              >
                {lesson.section.course.title}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-gray-50">{lesson.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* 動画プレイヤー */}
            <div className="mb-6">
              <YouTubePlayerWrapper videoId={lesson.youtube_video_id} />
            </div>

            {/* レッスン情報 */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-50">
                    {lesson.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lesson.section.title}
                  </p>
                </div>
                {user && <CompleteButton lessonId={lessonId} courseId={courseId} isCompleted={isCompleted} />}
              </div>

              {lesson.description && (
                <p className="text-gray-600 dark:text-gray-400">{lesson.description}</p>
              )}
            </div>

            {/* レッスンナビゲーション */}
            <LessonNavigation
              courseId={courseId}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
            />
          </div>

          {/* サイドバー: カリキュラム */}
          <Suspense fallback={<CurriculumSkeleton />}>
            <LessonCurriculumSidebar
              courseId={courseId}
              currentLessonId={lessonId}
              sections={sortedSections}
              firstLessonId={firstLessonId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

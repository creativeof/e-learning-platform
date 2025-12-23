import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ProgressStats from '@/app/_components/course/ProgressStats'
import { calculateProgress } from '@/lib/utils/progress'

export const metadata: Metadata = {
  title: 'マイ講座',
  description: '受講中の講座一覧',
}

export default async function MyCoursesPage() {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ユーザーの進捗データを取得
  const { data: progressData } = await supabase
    .from('progress')
    .select(
      `
      lesson_id,
      completed,
      lesson:lessons(
        id,
        section:sections(
          course_id,
          course:courses(*)
        )
      )
    `
    )
    .eq('user_id', user.id)

  // 講座ごとにグループ化して進捗を計算
  const coursesMap = new Map()

  if (progressData) {
    for (const progress of progressData) {
      const lesson = progress.lesson as any
      if (!lesson?.section?.course) continue

      const course = lesson.section.course
      const courseId = course.id

      if (!coursesMap.has(courseId)) {
        // その講座の全レッスン数を取得
        const { data: allSections } = await supabase
          .from('sections')
          .select('lessons(*)')
          .eq('course_id', courseId)

        const totalLessons =
          allSections?.reduce((sum, section: any) => sum + (section.lessons?.length || 0), 0) || 0

        coursesMap.set(courseId, {
          course,
          totalLessons,
          completedLessons: 0,
          lessons: [],
        })
      }

      const courseData = coursesMap.get(courseId)
      courseData.lessons.push(progress.lesson_id)
      if (progress.completed) {
        courseData.completedLessons++
      }
    }
  }

  const courses = Array.from(coursesMap.values())

  // 最初の未完了レッスンを取得する関数
  async function getNextLesson(courseId: string, completedLessonIds: string[]) {
    const { data: sections } = await supabase
      .from('sections')
      .select('*, lessons(*)')
      .eq('course_id', courseId)
      .order('"order"', { ascending: true })

    if (!sections) return null

    const sortedSections = sections
      .sort((a: any, b: any) => a.order - b.order)
      .map((section: any) => ({
        ...section,
        lessons: section.lessons?.sort((a: any, b: any) => a.order - b.order) || [],
      }))

    for (const section of sortedSections) {
      for (const lesson of section.lessons) {
        if (!completedLessonIds.includes(lesson.id)) {
          return lesson
        }
      }
    }

    // すべて完了している場合は最初のレッスンを返す
    return sortedSections[0]?.lessons[0] || null
  }

  // 各講座の次のレッスンを取得
  const coursesWithNextLesson = await Promise.all(
    courses.map(async (courseData) => {
      const nextLesson = await getNextLesson(courseData.course.id, courseData.lessons)
      return {
        ...courseData,
        nextLesson,
      }
    })
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-50">マイ講座</h1>

        {coursesWithNextLesson.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">
              受講中の講座がありません
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              講座一覧から学習を始めましょう
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              講座一覧を見る
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesWithNextLesson.map(({ course, totalLessons, completedLessons, nextLesson }) => {
              const progress = calculateProgress(totalLessons, completedLessons)

              return (
                <div
                  key={course.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* サムネイル */}
                  <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                        画像なし
                      </div>
                    )}
                  </div>

                  {/* 講座情報 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-50">
                      {course.title}
                    </h3>

                    {/* 進捗統計 */}
                    <div className="mb-4">
                      <ProgressStats
                        completed={progress.completed}
                        total={progress.total}
                        percentage={progress.percentage}
                        remaining={progress.remaining}
                      />
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      {nextLesson && progress.percentage < 100 && (
                        <Link
                          href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                        >
                          続きから再生
                        </Link>
                      )}
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-50 font-medium rounded-lg transition-colors text-center"
                      >
                        講座を見る
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

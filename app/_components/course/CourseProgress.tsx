import { createClient } from '@/lib/supabase/server'
import ProgressBar from './ProgressBar'

interface CourseProgressProps {
  courseId: string
  sections: any[]
}

export default async function CourseProgress({ courseId, sections }: CourseProgressProps) {
  const supabase = await createClient()

  // 認証ユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // レッスンIDリストを取得
  const lessonIds = sections.flatMap((section: any) =>
    section.lessons.map((lesson: any) => lesson.id)
  )

  // 進捗データを取得
  const { data: progressData } = await supabase
    .from('progress')
    .select('lesson_id, completed')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds)

  // 進捗率を計算
  const totalLessons = sections.reduce(
    (sum: number, section: any) => sum + section.lessons.length,
    0
  )
  const completedLessons = progressData?.filter((p) => p.completed).length || 0
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="mb-6">
      <ProgressBar
        completed={completedLessons}
        total={totalLessons}
        percentage={progressPercentage}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Curriculum from './Curriculum'

interface CourseCurriculumAsyncProps {
  courseId: string
  sections: any[]
}

export default async function CourseCurriculumAsync({
  courseId,
  sections,
}: CourseCurriculumAsyncProps) {
  const supabase = await createClient()

  // 認証ユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let progressData: { lesson_id: string; completed: boolean }[] = []

  if (user) {
    const lessonIds = sections.flatMap((section: any) =>
      section.lessons.map((lesson: any) => lesson.id)
    )

    const { data: progress } = await supabase
      .from('progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds)

    progressData = progress || []
  }

  return (
    <Curriculum
      sections={sections}
      progress={progressData}
      courseId={courseId}
      isAuthenticated={!!user}
    />
  )
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markLessonComplete(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('認証が必要です')
  }

  // レッスンの存在とアクセス可能性を検証
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id, section:sections(id, course_id)')
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    throw new Error('レッスンが見つかりません')
  }

  // レッスンが指定された講座に属しているか検証
  if ((lesson.section as any)?.course_id !== courseId) {
    throw new Error('不正なリクエストです')
  }

  const { error } = await supabase.from('progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,lesson_id',
    }
  )

  if (error) {
    console.error('Progress update error:', error)
    throw new Error('進捗の更新に失敗しました')
  }

  // 講座詳細ページの進捗率を再検証
  revalidatePath(`/courses/${courseId}`)
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  revalidatePath('/my-courses')

  return { success: true }
}

export async function markLessonIncomplete(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('認証が必要です')
  }

  // レッスンの存在とアクセス可能性を検証
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id, section:sections(id, course_id)')
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    throw new Error('レッスンが見つかりません')
  }

  // レッスンが指定された講座に属しているか検証
  if ((lesson.section as any)?.course_id !== courseId) {
    throw new Error('不正なリクエストです')
  }

  const { error } = await supabase
    .from('progress')
    .update({ completed: false, completed_at: null })
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)

  if (error) {
    console.error('Progress update error:', error)
    throw new Error('進捗の更新に失敗しました')
  }

  // 講座詳細ページの進捗率を再検証
  revalidatePath(`/courses/${courseId}`)
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  revalidatePath('/my-courses')

  return { success: true }
}

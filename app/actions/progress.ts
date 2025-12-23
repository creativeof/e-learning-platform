'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  handleServerActionError,
} from '@/lib/utils/errors'

export async function markLessonComplete(lessonId: string, courseId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new UnauthorizedError('User not authenticated', '認証が必要です。ログインしてください。')
    }

    // レッスンの存在とアクセス可能性を検証
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, section:sections(id, course_id)')
      .eq('id', lessonId)
      .single()

    if (lessonError || !lesson) {
      throw new NotFoundError(
        `Lesson not found: ${lessonId}`,
        'レッスンが見つかりません。'
      )
    }

    // レッスンが指定された講座に属しているか検証
    if ((lesson.section as any)?.course_id !== courseId) {
      throw new ValidationError(
        `Lesson ${lessonId} does not belong to course ${courseId}`,
        '不正なリクエストです。'
      )
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
      throw new Error(`Failed to update progress: ${error.message}`)
    }

    // 講座詳細ページの進捗率を再検証
    revalidatePath(`/courses/${courseId}`)
    revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
    revalidatePath('/my-courses')

    return { success: true }
  } catch (error) {
    handleServerActionError('markLessonComplete', error, { lessonId, courseId })
  }
}

export async function markLessonIncomplete(lessonId: string, courseId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new UnauthorizedError('User not authenticated', '認証が必要です。ログインしてください。')
    }

    // レッスンの存在とアクセス可能性を検証
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, section:sections(id, course_id)')
      .eq('id', lessonId)
      .single()

    if (lessonError || !lesson) {
      throw new NotFoundError(
        `Lesson not found: ${lessonId}`,
        'レッスンが見つかりません。'
      )
    }

    // レッスンが指定された講座に属しているか検証
    if ((lesson.section as any)?.course_id !== courseId) {
      throw new ValidationError(
        `Lesson ${lessonId} does not belong to course ${courseId}`,
        '不正なリクエストです。'
      )
    }

    const { error } = await supabase
      .from('progress')
      .update({ completed: false, completed_at: null })
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`)
    }

    // 講座詳細ページの進捗率を再検証
    revalidatePath(`/courses/${courseId}`)
    revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
    revalidatePath('/my-courses')

    return { success: true }
  } catch (error) {
    handleServerActionError('markLessonIncomplete', error, { lessonId, courseId })
  }
}

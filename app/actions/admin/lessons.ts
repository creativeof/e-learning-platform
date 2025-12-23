'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createLesson(sectionId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const youtube_video_id = formData.get('youtube_video_id') as string

  if (!title || !youtube_video_id) {
    throw new Error('タイトルとYouTube動画IDは必須です')
  }

  // YouTube動画IDのバリデーション（11文字の英数字、ハイフン、アンダースコア）
  if (!/^[a-zA-Z0-9_-]{11}$/.test(youtube_video_id)) {
    throw new Error('無効なYouTube動画IDです（11文字の英数字である必要があります）')
  }

  const supabase = await createClient()

  // 既存レッスン数を取得
  const { count } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('section_id', sectionId)

  const order = (count || 0) + 1

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      section_id: sectionId,
      title,
      description,
      youtube_video_id,
      order,
    })
    .select()
    .single()

  if (error) throw error

  // courseIdを取得してrevalidate
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', sectionId)
    .single()

  if (section) {
    revalidatePath(`/admin/courses/${section.course_id}/edit`)
    revalidatePath(`/courses/${section.course_id}`)
  }

  return data
}

export async function updateLesson(lessonId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const youtube_video_id = formData.get('youtube_video_id') as string

  if (!title || !youtube_video_id) {
    throw new Error('タイトルとYouTube動画IDは必須です')
  }

  // YouTube動画IDのバリデーション
  if (!/^[a-zA-Z0-9_-]{11}$/.test(youtube_video_id)) {
    throw new Error('無効なYouTube動画IDです（11文字の英数字である必要があります）')
  }

  const supabase = await createClient()

  const { data: lesson, error } = await supabase
    .from('lessons')
    .update({
      title,
      description,
      youtube_video_id,
    })
    .eq('id', lessonId)
    .select('section_id')
    .single()

  if (error) throw error

  // courseIdを取得してrevalidate
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', lesson.section_id)
    .single()

  if (section) {
    revalidatePath(`/admin/courses/${section.course_id}/edit`)
    revalidatePath(`/courses/${section.course_id}`)
  }

  return { success: true }
}

export async function deleteLesson(lessonId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // レッスンの情報を取得
  const { data: lesson } = await supabase
    .from('lessons')
    .select('section_id')
    .eq('id', lessonId)
    .single()

  if (!lesson) throw new Error('レッスンが見つかりません')

  // courseIdを取得
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', lesson.section_id)
    .single()

  // レッスンを削除
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

  if (error) throw error

  if (section) {
    revalidatePath(`/admin/courses/${section.course_id}/edit`)
    revalidatePath(`/courses/${section.course_id}`)
  }

  return { success: true }
}

export async function moveLessonUp(lessonId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // Use atomic PostgreSQL function for order swapping
  const { data, error } = await supabase.rpc('swap_lesson_order', {
    p_lesson_id: lessonId,
    p_direction: 'up',
  })

  if (error) {
    console.error('Error swapping lesson order:', error)
    throw new Error('レッスンの順序変更に失敗しました')
  }

  // Check result
  if (!data || data.length === 0 || !data[0].success) {
    const message = data?.[0]?.message || '順序の変更ができませんでした'
    return { success: false, message }
  }

  // Get course ID for revalidation
  const { data: lesson } = await supabase
    .from('lessons')
    .select('section:sections(course_id)')
    .eq('id', lessonId)
    .single()

  if (lesson?.section) {
    const courseId = (lesson.section as any).course_id
    revalidatePath(`/admin/courses/${courseId}/edit`)
    revalidatePath(`/courses/${courseId}`)
  }

  return { success: true }
}

export async function moveLessonDown(lessonId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // Use atomic PostgreSQL function for order swapping
  const { data, error } = await supabase.rpc('swap_lesson_order', {
    p_lesson_id: lessonId,
    p_direction: 'down',
  })

  if (error) {
    console.error('Error swapping lesson order:', error)
    throw new Error('レッスンの順序変更に失敗しました')
  }

  // Check result
  if (!data || data.length === 0 || !data[0].success) {
    const message = data?.[0]?.message || '順序の変更ができませんでした'
    return { success: false, message }
  }

  // Get course ID for revalidation
  const { data: lesson } = await supabase
    .from('lessons')
    .select('section:sections(course_id)')
    .eq('id', lessonId)
    .single()

  if (lesson?.section) {
    const courseId = (lesson.section as any).course_id
    revalidatePath(`/admin/courses/${courseId}/edit`)
    revalidatePath(`/courses/${courseId}`)
  }

  return { success: true }
}

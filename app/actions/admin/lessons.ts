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

  // 現在のレッスンを取得
  const { data: currentLesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!currentLesson) throw new Error('レッスンが見つかりません')

  // 1つ上のレッスンを取得
  const { data: previousLessons, error: previousError } = await supabase
    .from('lessons')
    .select('*')
    .eq('section_id', currentLesson.section_id)
    .lt('"order"', currentLesson.order)

  if (previousError) {
    console.error('Error fetching previous lesson:', previousError)
    throw new Error('前のレッスンの取得に失敗しました')
  }

  if (!previousLessons || previousLessons.length === 0) {
    return { success: false } // 既に最上位
  }

  // クライアント側でソートして最後の要素（最大のorder値）を取得
  const previousLesson = previousLessons.sort((a, b) => b.order - a.order)[0]

  // 順序を入れ替え（一時的な値を使用して競合を回避）
  const tempOrder = -999999
  const currentOrder = currentLesson.order
  const previousOrder = previousLesson.order

  // 1. 現在のレッスンを一時的な値に変更
  await supabase
    .from('lessons')
    .update({ order: tempOrder })
    .eq('id', currentLesson.id)

  // 2. 前のレッスンを現在の位置に移動
  await supabase
    .from('lessons')
    .update({ order: currentOrder })
    .eq('id', previousLesson.id)

  // 3. 現在のレッスンを前の位置に移動
  await supabase
    .from('lessons')
    .update({ order: previousOrder })
    .eq('id', currentLesson.id)

  // courseIdを取得してrevalidate
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', currentLesson.section_id)
    .single()

  if (section) {
    revalidatePath(`/admin/courses/${section.course_id}/edit`)
    revalidatePath(`/courses/${section.course_id}`)
  }

  return { success: true }
}

export async function moveLessonDown(lessonId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 現在のレッスンを取得
  const { data: currentLesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!currentLesson) throw new Error('レッスンが見つかりません')

  // 1つ下のレッスンを取得
  const { data: nextLessons, error: nextError } = await supabase
    .from('lessons')
    .select('*')
    .eq('section_id', currentLesson.section_id)
    .gt('"order"', currentLesson.order)

  if (nextError) {
    console.error('Error fetching next lesson:', nextError)
    throw new Error('次のレッスンの取得に失敗しました')
  }

  if (!nextLessons || nextLessons.length === 0) {
    return { success: false } // 既に最下位
  }

  // クライアント側でソートして最初の要素（最小のorder値）を取得
  const nextLesson = nextLessons.sort((a, b) => a.order - b.order)[0]

  // 順序を入れ替え（一時的な値を使用して競合を回避）
  const tempOrder = -999999
  const currentOrder = currentLesson.order
  const nextOrder = nextLesson.order

  // 1. 現在のレッスンを一時的な値に変更
  await supabase
    .from('lessons')
    .update({ order: tempOrder })
    .eq('id', currentLesson.id)

  // 2. 次のレッスンを現在の位置に移動
  await supabase
    .from('lessons')
    .update({ order: currentOrder })
    .eq('id', nextLesson.id)

  // 3. 現在のレッスンを次の位置に移動
  await supabase
    .from('lessons')
    .update({ order: nextOrder })
    .eq('id', currentLesson.id)

  // courseIdを取得してrevalidate
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', currentLesson.section_id)
    .single()

  if (section) {
    revalidatePath(`/admin/courses/${section.course_id}/edit`)
    revalidatePath(`/courses/${section.course_id}`)
  }

  return { success: true }
}

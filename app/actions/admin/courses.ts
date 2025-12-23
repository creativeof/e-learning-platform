'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCourse(formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const thumbnail_url = formData.get('thumbnail_url') as string
  const category_id = formData.get('category_id') as string
  const tagIds = formData.getAll('tags') as string[]

  // バリデーション
  if (!title || !description || !category_id) {
    throw new Error('必須フィールドが入力されていません')
  }

  const supabase = await createClient()

  // 講座作成
  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
      thumbnail_url,
      category_id,
    })
    .select()
    .single()

  if (error) throw error

  // タグ関連付け
  if (tagIds.length > 0) {
    const courseTags = tagIds.map((tagId) => ({
      course_id: course.id,
      tag_id: tagId,
    }))

    const { error: tagError } = await supabase.from('course_tags').insert(courseTags)
    if (tagError) throw tagError
  }

  revalidatePath('/admin/courses')
  revalidatePath('/courses')

  redirect('/admin/courses')
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const thumbnail_url = formData.get('thumbnail_url') as string
  const category_id = formData.get('category_id') as string
  const tagIds = formData.getAll('tags') as string[]

  // バリデーション
  if (!title || !description || !category_id) {
    throw new Error('必須フィールドが入力されていません')
  }

  const supabase = await createClient()

  // 講座更新
  const { error } = await supabase
    .from('courses')
    .update({
      title,
      description,
      thumbnail_url,
      category_id,
    })
    .eq('id', courseId)

  if (error) throw error

  // 既存のタグ関連を削除
  await supabase.from('course_tags').delete().eq('course_id', courseId)

  // 新しいタグを追加
  if (tagIds.length > 0) {
    const courseTags = tagIds.map((tagId) => ({
      course_id: courseId,
      tag_id: tagId,
    }))

    const { error: tagError } = await supabase.from('course_tags').insert(courseTags)
    if (tagError) throw tagError
  }

  revalidatePath('/admin/courses')
  revalidatePath(`/courses/${courseId}`)

  redirect('/admin/courses')
}

export async function deleteCourse(courseId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 関連データを削除（セクション、レッスンはCASCADE設定により自動削除）
  const { error } = await supabase.from('courses').delete().eq('id', courseId)

  if (error) throw error

  revalidatePath('/admin/courses')
  revalidatePath('/courses')

  return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createTag(formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string

  if (!name) {
    throw new Error('タグ名は必須です')
  }

  const supabase = await createClient()

  // ユニーク制約チェック
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existing) {
    throw new Error('このタグ名は既に存在します')
  }

  const { data, error } = await supabase.from('tags').insert({ name }).select().single()

  if (error) throw error

  revalidatePath('/admin/tags')

  return data
}

export async function updateTag(tagId: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string

  if (!name) {
    throw new Error('タグ名は必須です')
  }

  const supabase = await createClient()

  // ユニーク制約チェック（自分以外）
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .neq('id', tagId)
    .maybeSingle()

  if (existing) {
    throw new Error('このタグ名は既に存在します')
  }

  const { error } = await supabase.from('tags').update({ name }).eq('id', tagId)

  if (error) throw error

  revalidatePath('/admin/tags')
  revalidatePath('/courses')

  return { success: true }
}

export async function deleteTag(tagId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // course_tagsの関連レコードを削除
  await supabase.from('course_tags').delete().eq('tag_id', tagId)

  // タグを削除
  const { error } = await supabase.from('tags').delete().eq('id', tagId)

  if (error) throw error

  revalidatePath('/admin/tags')
  revalidatePath('/courses')

  return { success: true }
}

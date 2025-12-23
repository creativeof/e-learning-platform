'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    throw new Error('カテゴリ名は必須です')
  }

  const supabase = await createClient()

  // ユニーク制約チェック
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existing) {
    throw new Error('このカテゴリ名は既に存在します')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, description })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/admin/categories')

  return data
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    throw new Error('カテゴリ名は必須です')
  }

  const supabase = await createClient()

  // ユニーク制約チェック（自分以外）
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .neq('id', categoryId)
    .maybeSingle()

  if (existing) {
    throw new Error('このカテゴリ名は既に存在します')
  }

  const { error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', categoryId)

  if (error) throw error

  revalidatePath('/admin/categories')
  revalidatePath('/courses')

  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 紐づく講座の存在チェック
  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (count && count > 0) {
    throw new Error(`このカテゴリに紐づく講座が${count}件存在するため削除できません`)
  }

  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) throw error

  revalidatePath('/admin/categories')

  return { success: true }
}

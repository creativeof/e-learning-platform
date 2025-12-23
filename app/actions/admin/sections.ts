'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createSection(courseId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title) {
    throw new Error('タイトルは必須です')
  }

  const supabase = await createClient()

  // 既存セクション数を取得
  const { count } = await supabase
    .from('sections')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  const order = (count || 0) + 1

  const { data, error } = await supabase
    .from('sections')
    .insert({
      course_id: courseId,
      title,
      description,
      order,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/admin/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)

  return data
}

export async function updateSection(sectionId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title) {
    throw new Error('タイトルは必須です')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sections')
    .update({
      title,
      description,
    })
    .eq('id', sectionId)
    .select('course_id')
    .single()

  if (error) throw error

  revalidatePath(`/admin/courses/${data.course_id}/edit`)
  revalidatePath(`/courses/${data.course_id}`)

  return { success: true }
}

export async function deleteSection(sectionId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 講座IDを取得
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', sectionId)
    .single()

  if (!section) throw new Error('セクションが見つかりません')

  // セクションを削除（レッスンはCASCADE設定により自動削除）
  const { error } = await supabase.from('sections').delete().eq('id', sectionId)

  if (error) throw error

  revalidatePath(`/admin/courses/${section.course_id}/edit`)
  revalidatePath(`/courses/${section.course_id}`)

  return { success: true }
}

export async function moveSectionUp(sectionId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 現在のセクションを取得
  const { data: currentSection, error: currentError } = await supabase
    .from('sections')
    .select('*')
    .eq('id', sectionId)
    .single()

  if (currentError || !currentSection) {
    console.error('Error fetching current section:', currentError)
    throw new Error('セクションが見つかりません')
  }

  // 1つ上のセクションを取得（orderフィールドでソート）
  const { data: previousSections, error: previousError } = await supabase
    .from('sections')
    .select('*')
    .eq('course_id', currentSection.course_id)
    .lt('"order"', currentSection.order)

  if (previousError) {
    console.error('Error fetching previous section:', previousError)
    throw new Error(`前のセクションの取得に失敗しました: ${previousError.message}`)
  }

  if (!previousSections || previousSections.length === 0) {
    return { success: false } // 既に最上位
  }

  // クライアント側でソートして最後の要素（最大のorder値）を取得
  const previousSection = previousSections.sort((a, b) => b.order - a.order)[0]

  console.log('Moving section up:', {
    current: { id: currentSection.id, order: currentSection.order },
    previous: { id: previousSection.id, order: previousSection.order }
  })

  // 順序を入れ替え（一時的な値を使用して競合を回避）
  const tempOrder = -999999
  const currentOrder = currentSection.order
  const previousOrder = previousSection.order

  // 1. 現在のセクションを一時的な値に変更
  const { error: error1 } = await supabase
    .from('sections')
    .update({ order: tempOrder })
    .eq('id', currentSection.id)

  if (error1) {
    console.error('Error in step 1:', error1)
    throw new Error('並び替えに失敗しました（ステップ1）')
  }

  // 2. 前のセクションを現在の位置に移動
  const { error: error2 } = await supabase
    .from('sections')
    .update({ order: currentOrder })
    .eq('id', previousSection.id)

  if (error2) {
    console.error('Error in step 2:', error2)
    throw new Error('並び替えに失敗しました（ステップ2）')
  }

  // 3. 現在のセクションを前の位置に移動
  const { error: error3 } = await supabase
    .from('sections')
    .update({ order: previousOrder })
    .eq('id', currentSection.id)

  if (error3) {
    console.error('Error in step 3:', error3)
    throw new Error('並び替えに失敗しました（ステップ3）')
  }

  console.log('Section moved successfully')

  revalidatePath(`/admin/courses/${currentSection.course_id}/edit`)
  revalidatePath(`/courses/${currentSection.course_id}`)

  return { success: true }
}

export async function moveSectionDown(sectionId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 現在のセクションを取得
  const { data: currentSection } = await supabase
    .from('sections')
    .select('*')
    .eq('id', sectionId)
    .single()

  if (!currentSection) throw new Error('セクションが見つかりません')

  // 1つ下のセクションを取得
  const { data: nextSections, error: nextError } = await supabase
    .from('sections')
    .select('*')
    .eq('course_id', currentSection.course_id)
    .gt('"order"', currentSection.order)

  if (nextError) {
    console.error('Error fetching next section:', nextError)
    throw new Error('次のセクションの取得に失敗しました')
  }

  if (!nextSections || nextSections.length === 0) {
    return { success: false } // 既に最下位
  }

  // クライアント側でソートして最初の要素（最小のorder値）を取得
  const nextSection = nextSections.sort((a, b) => a.order - b.order)[0]

  // 順序を入れ替え（一時的な値を使用して競合を回避）
  const tempOrder = -999999
  const currentOrder = currentSection.order
  const nextOrder = nextSection.order

  // 1. 現在のセクションを一時的な値に変更
  await supabase
    .from('sections')
    .update({ order: tempOrder })
    .eq('id', currentSection.id)

  // 2. 次のセクションを現在の位置に移動
  await supabase
    .from('sections')
    .update({ order: currentOrder })
    .eq('id', nextSection.id)

  // 3. 現在のセクションを次の位置に移動
  await supabase
    .from('sections')
    .update({ order: nextOrder })
    .eq('id', currentSection.id)

  revalidatePath(`/admin/courses/${currentSection.course_id}/edit`)
  revalidatePath(`/courses/${currentSection.course_id}`)

  return { success: true }
}

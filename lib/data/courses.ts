import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * 講座データを取得（メタデータとページコンポーネント間でキャッシュ）
 */
export const getCourse = cache(async (courseId: string) => {
  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(*),
      course_tags(tag:tags(*)),
      sections(
        *,
        lessons(*)
      )
    `)
    .eq('id', courseId)
    .single()

  return { course, error }
})

/**
 * 講座の基本情報を取得（メタデータ用）
 */
export const getCourseMetadata = cache(async (courseId: string) => {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('title, description, thumbnail_url')
    .eq('id', courseId)
    .single()

  return course
})

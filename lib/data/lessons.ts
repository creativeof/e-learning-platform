import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * レッスンデータを取得（メタデータとページコンポーネント間でキャッシュ）
 */
export const getLesson = cache(async (lessonId: string) => {
  const supabase = await createClient()

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      *,
      section:sections(
        *,
        course:courses(*),
        lessons(*)
      )
    `)
    .eq('id', lessonId)
    .single()

  return { lesson, error }
})

/**
 * レッスンの基本情報を取得（メタデータ用）
 */
export const getLessonMetadata = cache(async (lessonId: string) => {
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('title, description')
    .eq('id', lessonId)
    .single()

  return lesson
})

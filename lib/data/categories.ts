import { createClient } from '@/lib/supabase/server'

/**
 * カテゴリ一覧を取得
 * カテゴリは変更頻度が低いため、Supabase の RLS で保護されている
 * Next.js の fetch cache を利用して自動的にキャッシュされる
 */
export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return data || []
}

/**
 * カテゴリを名前で検索（キャッシュなし）
 * 管理画面での重複チェックなど、リアルタイム性が必要な場合に使用
 */
export async function findCategoryByName(name: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .maybeSingle()

  return data
}

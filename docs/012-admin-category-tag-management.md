# 012: 管理画面 - カテゴリ・タグ管理

## 概要
管理者がカテゴリとタグを作成・編集・削除できる機能を実装する。

## フェーズ
フェーズ3: 管理者機能

## タスク

### カテゴリ管理ページ

#### ページ作成
- [x] `app/admin/categories/page.tsx` ファイルを作成
- [x] 管理者権限チェック

#### データ取得
- [x] すべてのカテゴリを取得
- [x] 各カテゴリに紐づく講座数を集計

```typescript
const { data: categories } = await supabase
  .from('categories')
  .select(`
    *,
    courses(count)
  `)
  .order('name')
```

#### UI実装
- [x] ページタイトル「カテゴリ管理」
- [x] 「新規カテゴリ作成」ボタン
- [x] カテゴリ一覧テーブル
  - [x] カテゴリ名
  - [x] 説明文
  - [x] 講座数
  - [x] 作成日
  - [x] アクション（編集・削除ボタン）

#### カテゴリ作成フォーム
- [x] `app/_components/admin/CategoryForm.tsx` を作成（Client Component）
- [x] モーダルまたはインラインフォーム
- [x] フィールド
  - [x] カテゴリ名（必須、ユニーク制約）
  - [x] 説明文
- [x] バリデーション

```typescript
'use client'

import { createCategory } from '@/app/actions/admin/categories'
import { useState } from 'react'

export function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      await createCategory(formData)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      // エラー表示
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="カテゴリ名" required />
      <textarea name="description" placeholder="説明文" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '作成中...' : '作成'}
      </button>
    </form>
  )
}
```

#### カテゴリ編集
- [x] 編集モーダルまたはインライン編集
- [x] 既存データを初期値として表示

#### カテゴリ削除
- [x] 削除ボタン
- [x] 確認ダイアログ
- [x] 紐づく講座がある場合は削除不可（警告表示）

### タグ管理ページ

#### ページ作成
- [x] `app/admin/tags/page.tsx` ファイルを作成
- [x] 管理者権限チェック

#### データ取得
- [x] すべてのタグを取得
- [x] 各タグに紐づく講座数を集計

```typescript
const { data: tags } = await supabase
  .from('tags')
  .select(`
    *,
    course_tags(count)
  `)
  .order('name')
```

#### UI実装
- [x] ページタイトル「タグ管理」
- [x] 「新規タグ作成」ボタン
- [x] タグ一覧テーブルまたはカード表示
  - [x] タグ名
  - [x] 講座数
  - [x] アクション（編集・削除ボタン）

#### タグ作成フォーム
- [x] `app/_components/admin/TagForm.tsx` を作成
- [x] フィールド
  - [x] タグ名（必須、ユニーク制約）
- [x] バリデーション

#### タグ編集
- [x] 編集モーダルまたはインライン編集

#### タグ削除
- [x] 削除ボタン
- [x] 確認ダイアログ
- [x] 紐づく講座がある場合は警告表示（削除は可能）

### Server Actions

#### カテゴリ作成
- [x] `app/actions/admin/categories.ts` ファイルを作成
- [x] `createCategory` Server Action実装
- [x] ユニーク制約チェック

```typescript
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
```

#### カテゴリ更新
- [x] `updateCategory` Server Action実装

```typescript
export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string

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
```

#### カテゴリ削除
- [x] `deleteCategory` Server Action実装
- [x] 紐づく講座の存在チェック

```typescript
export async function deleteCategory(categoryId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 紐づく講座の存在チェック
  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (count && count > 0) {
    throw new Error('このカテゴリに紐づく講座が存在するため削除できません')
  }

  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) throw error

  revalidatePath('/admin/categories')

  return { success: true }
}
```

#### タグ作成
- [x] `app/actions/admin/tags.ts` ファイルを作成
- [x] `createTag` Server Action実装
- [x] ユニーク制約チェック

```typescript
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

  const { data, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/admin/tags')

  return data
}
```

#### タグ更新
- [x] `updateTag` Server Action実装

#### タグ削除
- [x] `deleteTag` Server Action実装
- [x] `course_tags` テーブルの関連レコードも削除

```typescript
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
```

### モーダルコンポーネント（オプション）
- [x] `app/_components/ui/Modal.tsx` を作成
- [x] 再利用可能なモーダルコンポーネント
- [x] 作成・編集フォームで使用

### エラーハンドリング
- [x] ユニーク制約違反のエラー表示
- [x] 削除不可の場合のエラー表示
- [x] バリデーションエラー表示

## 関連ファイル
- `app/admin/categories/page.tsx`
- `app/admin/tags/page.tsx`
- `app/_components/admin/CategoryForm.tsx`
- `app/_components/admin/TagForm.tsx`
- `app/_components/ui/Modal.tsx`
- `app/actions/admin/categories.ts`
- `app/actions/admin/tags.ts`

## 参考情報
- [Supabase Unique Constraints](https://supabase.com/docs/guides/database/tables#constraints)

## 完了条件
- [x] カテゴリの作成・編集・削除が正しく機能する
- [x] タグの作成・編集・削除が正しく機能する
- [x] ユニーク制約が正しくチェックされる
- [x] 紐づく講座がある場合の削除制限が機能する
- [x] エラーハンドリングが適切に実装されている
- [x] 管理者のみアクセス可能

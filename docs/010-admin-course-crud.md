# 010: 管理画面 - 講座CRUD

## 概要
管理者が講座を作成・編集・削除できる機能を実装する。

## フェーズ
フェーズ3: 管理者機能

## タスク

### 講座一覧ページ

#### ページ作成
- [x] `app/admin/courses/page.tsx` ファイルを作成
- [x] 管理者権限チェック

#### データ取得
- [x] すべての講座を取得
- [x] カテゴリ情報を含めて取得
- [x] セクション・レッスン数を集計

```typescript
const { data: courses } = await supabase
  .from('courses')
  .select(`
    *,
    category:categories(*),
    sections(count)
  `)
  .order('created_at', { ascending: false })
```

#### UI実装
- [x] ページタイトル「講座管理」
- [x] 「新規講座作成」ボタン
- [x] 講座一覧テーブル表示
  - [x] サムネイル
  - [x] 講座タイトル
  - [x] カテゴリ
  - [x] セクション数
  - [x] 作成日
  - [x] アクション（編集・削除ボタン）
- [x] テーブルのレスポンシブ対応

### 講座作成ページ

#### ページ作成
- [x] `app/admin/courses/new/page.tsx` ファイルを作成
- [x] 管理者権限チェック

#### フォームコンポーネント
- [x] `app/_components/admin/CourseForm.tsx` を作成（Client Component）
- [x] フォームフィールド
  - [x] 講座タイトル（必須）
  - [x] 講座説明文（必須、textarea）
  - [x] サムネイルURL（オプション）
  - [x] カテゴリ選択（ドロップダウン）
  - [x] タグ選択（マルチセレクト）
- [x] バリデーション（クライアントサイド）
- [x] 送信ボタン・キャンセルボタン

```typescript
'use client'

import { createCourse } from '@/app/actions/admin/courses'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CourseForm({ categories, tags }: { categories: Category[], tags: Tag[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      await createCourse(formData)
      router.push('/admin/courses')
    } catch (error) {
      console.error(error)
      // エラー表示
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* フォームフィールド */}
    </form>
  )
}
```

### 講座編集ページ

#### ページ作成
- [x] `app/admin/courses/[courseId]/edit/page.tsx` ファイルを作成
- [x] 管理者権限チェック

#### データ取得
- [x] 編集対象の講座データを取得
- [x] 関連するタグを取得

```typescript
const { data: course } = await supabase
  .from('courses')
  .select(`
    *,
    course_tags(tag:tags(*))
  `)
  .eq('id', courseId)
  .single()
```

#### UI実装
- [x] CourseFormコンポーネントを再利用
- [x] 初期値として既存データを渡す
- [x] フォーム送信時は更新処理を実行

### Server Actions

#### 講座作成アクション
- [x] `app/actions/admin/courses.ts` ファイルを作成
- [x] `createCourse` Server Action実装
- [x] 管理者権限チェック
- [x] バリデーション（サーバーサイド）
- [x] `courses` テーブルにinsert
- [x] タグがあれば `course_tags` テーブルにinsert
- [x] `revalidatePath` で講座一覧ページを再検証

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

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

    await supabase.from('course_tags').insert(courseTags)
  }

  revalidatePath('/admin/courses')
  revalidatePath('/courses')

  return course
}
```

#### 講座更新アクション
- [x] `updateCourse` Server Action実装
- [x] 既存のタグ関連を削除してから新しいタグを追加

```typescript
export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const thumbnail_url = formData.get('thumbnail_url') as string
  const category_id = formData.get('category_id') as string
  const tagIds = formData.getAll('tags') as string[]

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

    await supabase.from('course_tags').insert(courseTags)
  }

  revalidatePath('/admin/courses')
  revalidatePath(`/courses/${courseId}`)

  return { success: true }
}
```

#### 講座削除アクション
- [x] `deleteCourse` Server Action実装
- [x] カスケード削除（セクション、レッスン、進捗データも削除）
- [x] 確認ダイアログ実装（Client Component）

```typescript
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
```

### エラーハンドリング
- [x] フォームバリデーションエラー表示
- [x] Server Actionエラーのキャッチ
- [x] トースト通知でエラー表示（オプション、未実装）

### 成功メッセージ
- [x] 作成・更新・削除成功時にトースト通知（オプション、未実装）
- [x] リダイレクト後にメッセージ表示

## 関連ファイル
- `app/admin/courses/page.tsx`
- `app/admin/courses/new/page.tsx`
- `app/admin/courses/[courseId]/edit/page.tsx`
- `app/_components/admin/CourseForm.tsx`
- `app/actions/admin/courses.ts`

## 参考情報
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

## 完了条件
- [x] 講座の作成・編集・削除が正しく機能する
- [x] タグの関連付けが正しく機能する
- [x] バリデーションが適切に実装されている
- [x] エラーハンドリングが機能する
- [x] 管理者のみアクセス可能

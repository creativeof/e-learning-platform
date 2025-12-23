# 007: 進捗管理機能

## 概要
ユーザーのレッスン完了状態を記録し、進捗を管理する機能を実装する。

## フェーズ
フェーズ2: 一般ユーザー機能

## タスク

### Server Actions作成

#### レッスン完了マーク
- [x] `app/actions/progress.ts` ファイルを作成
- [x] `markLessonComplete` Server Action実装
- [x] ユーザー認証チェック
- [x] `progress` テーブルに upsert
- [x] `revalidatePath` で講座詳細ページを再検証

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
  })

  if (error) throw error

  // 講座詳細ページと受講中講座ページを再検証
  revalidatePath('/courses/[courseId]')
  revalidatePath('/my-courses')

  return { success: true }
}
```

#### レッスン未完了マーク
- [x] `markLessonIncomplete` Server Action実装
- [x] 完了フラグをfalseに更新

```typescript
export async function markLessonIncomplete(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('progress')
    .update({ completed: false, completed_at: null })
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)

  if (error) throw error

  revalidatePath('/courses/[courseId]')
  revalidatePath('/my-courses')

  return { success: true }
}
```

### 進捗率計算ユーティリティ
- [x] `lib/utils/progress.ts` ファイルを作成
- [x] 進捗率計算関数を実装

```typescript
export function calculateProgress(
  totalLessons: number,
  completedLessons: number
): {
  completed: number
  total: number
  percentage: number
} {
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return {
    completed: completedLessons,
    total: totalLessons,
    percentage,
  }
}
```

### 進捗表示コンポーネント

#### ProgressBar コンポーネント
- [x] `app/_components/ui/ProgressBar.tsx` を作成
- [x] 進捗バーUI実装
- [x] パーセンテージテキスト表示
- [x] アニメーション効果追加

```typescript
export function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">進捗</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

#### ProgressStats コンポーネント
- [x] `app/_components/course/ProgressStats.tsx` を作成
- [x] 完了レッスン数 / 総レッスン数 表示
- [x] 進捗率表示
- [x] 残りレッスン数表示（オプション）

### マイページ（受講中の講座）

#### ページ作成
- [x] `app/my-courses/page.tsx` ファイルを作成
- [x] 認証チェック（未認証はログインページにリダイレクト）

#### データ取得
- [x] ユーザーが進捗を持つ講座を取得
- [x] 各講座の進捗率を計算

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) redirect('/login')

const { data: coursesWithProgress } = await supabase
  .from('progress')
  .select(`
    lesson:lessons(
      section:sections(
        course:courses(*)
      )
    )
  `)
  .eq('user_id', user.id)
  .eq('completed', true)
```

#### UI実装
- [x] 受講中の講座カード表示
- [x] 各講座の進捗バー表示
- [x] 「続きから再生」ボタン（次の未完了レッスンへのリンク）
- [x] 完了済み講座の表示（100%達成）

### エラーハンドリング
- [x] Server Actionのエラーをtry-catchでキャッチ
- [x] エラーメッセージをユーザーに表示
- [ ] トースト通知実装（オプション）

### 楽観的UI更新
- [x] `useTransition` フックを使用
- [x] ボタンクリック時に即座にUIを更新
- [x] Server Actionの完了を待つ間はローディング状態を表示

## 関連ファイル
- `app/actions/progress.ts`
- `app/my-courses/page.tsx`
- `app/_components/ui/ProgressBar.tsx`
- `app/_components/course/ProgressStats.tsx`
- `lib/utils/progress.ts`

## 参考情報
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useTransition](https://react.dev/reference/react/useTransition)

## 完了条件
- [x] レッスン完了/未完了マークが正しく機能する
- [x] 進捗率が正しく計算され表示される
- [x] マイページで受講中の講座が表示される
- [x] 楽観的UI更新が機能する
- [x] エラーハンドリングが適切に実装されている

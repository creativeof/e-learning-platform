# 006: レッスン視聴ページ

## 概要
YouTube動画を埋め込んでレッスンを視聴し、進捗を記録できるページを実装する。

## フェーズ
フェーズ2: 一般ユーザー機能

## タスク

### ページルーティング
- [x] `app/courses/[courseId]/lessons/[lessonId]/page.tsx` ファイルを作成
- [x] 動的ルートパラメータ `courseId` と `lessonId` を取得

### データ取得

#### レッスンデータ取得
- [x] Server Componentでレッスン詳細を取得
- [x] セクション情報も取得
- [x] 同じセクション内の他のレッスンも取得（前後のレッスンナビゲーション用）

```typescript
const { data: lesson } = await supabase
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
```

#### 進捗データ取得
- [x] 認証ユーザーの現在のレッスン完了状態を取得

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle()
}
```

### アクセス制御
- [x] 未認証ユーザーのアクセスチェック
- [x] 最初のレッスン（order = 0）以外にアクセスした場合、ログインページにリダイレクト
- [x] 認証済みユーザーはすべてのレッスンにアクセス可能

```typescript
const { data: { user } } = await supabase.auth.getUser()

// 最初のレッスンかどうかをチェック
const isFirstLesson = lesson.order === 0 // または他のロジック

if (!user && !isFirstLesson) {
  redirect('/login')
}
```

### UI実装

#### YouTube動画プレイヤー
- [x] `app/_components/lesson/YouTubePlayer.tsx` コンポーネント作成
- [x] YouTube埋め込みiframeを実装
- [x] レスポンシブ対応（16:9アスペクト比維持）
- [x] 動的インポート（クライアントサイドのみでレンダリング）

```typescript
'use client'

export function YouTubePlayer({ videoId }: { videoId: string }) {
  return (
    <div className="relative aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
```

#### レッスン情報表示
- [x] レッスンタイトル表示
- [x] レッスン説明文表示
- [x] セクション名・講座名表示（パンくずリスト）

#### 完了ボタン
- [x] `app/_components/lesson/CompleteButton.tsx` コンポーネント作成（Client Component）
- [x] 「完了」ボタンUI実装
- [x] 完了済みの場合は「完了済み」と表示
- [x] ボタンクリックでServer Actionを呼び出し
- [x] `useTransition` で楽観的UI更新

```typescript
'use client'

import { markLessonComplete } from '@/app/actions/progress'
import { useTransition } from 'react'

export function CompleteButton({ lessonId, isCompleted }: { lessonId: string, isCompleted: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      await markLessonComplete(lessonId)
    })
  }

  return (
    <button onClick={handleComplete} disabled={isPending || isCompleted}>
      {isPending ? '処理中...' : isCompleted ? '完了済み' : '完了'}
    </button>
  )
}
```

#### ナビゲーション
- [x] 「前のレッスン」ボタン追加
- [x] 「次のレッスン」ボタン追加
- [x] 前後のレッスンが存在しない場合はボタンを無効化
- [x] 講座詳細ページへの「戻る」リンク

#### サイドバー（カリキュラム）
- [x] デスクトップ: 右サイドバーにカリキュラム全体を表示
- [x] 現在のレッスンをハイライト
- [x] 他のレッスンへのリンク
- [x] モバイル: 折りたたみ可能なカリキュラム

### Loading状態
- [x] `app/courses/[courseId]/lessons/[lessonId]/loading.tsx` を作成
- [x] スケルトンローディングUI実装

### エラーハンドリング
- [x] `app/courses/[courseId]/lessons/[lessonId]/error.tsx` を作成

### Metadata設定
- [x] `generateMetadata` 関数を実装
- [x] レッスンタイトルを含むページタイトル設定

## 関連ファイル
- `app/courses/[courseId]/lessons/[lessonId]/page.tsx`
- `app/courses/[courseId]/lessons/[lessonId]/loading.tsx`
- `app/courses/[courseId]/lessons/[lessonId]/error.tsx`
- `app/_components/lesson/YouTubePlayer.tsx`
- `app/_components/lesson/CompleteButton.tsx`
- `app/_components/lesson/LessonNavigation.tsx`

## 参考情報
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Next.js Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)

## 完了条件
- [x] YouTube動画が正しく埋め込まれ再生できる
- [x] 完了ボタンが機能し、進捗が記録される
- [x] 前後のレッスンナビゲーションが機能する
- [x] アクセス制御が正しく機能する（未認証は最初のレッスンのみ）
- [x] レスポンシブデザインが正しく機能する
- [x] サイドバーのカリキュラムで現在のレッスンがハイライトされる

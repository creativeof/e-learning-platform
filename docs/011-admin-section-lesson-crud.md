# 011: 管理画面 - セクション・レッスンCRUD

## 概要
管理者がセクションとレッスンを作成・編集・削除・並び替えできる機能を実装する。

## フェーズ
フェーズ3: 管理者機能

## タスク

### 講座編集ページの拡張

#### セクション・レッスン管理UI
- [x] `app/admin/courses/[courseId]/edit/page.tsx` を拡張
- [x] タブUIでコンテンツを切り替え
  - [x] 「基本情報」タブ（講座情報編集）
  - [x] 「カリキュラム」タブ（セクション・レッスン管理）

### カリキュラム管理コンポーネント

#### CurriculumEditor コンポーネント
- [x] `app/_components/admin/CurriculumEditor.tsx` を作成（Client Component）
- [x] セクション一覧表示
- [x] 各セクション内にレッスン一覧表示
- [x] 「新規セクション追加」ボタン
- [x] アコーディオンUIでセクションを展開/折りたたみ

### セクション管理

#### セクション作成フォーム
- [x] `app/_components/admin/SectionForm.tsx` を作成
- [x] モーダルまたはインラインフォーム
- [x] フィールド
  - [x] セクションタイトル（必須）
  - [x] セクション説明文
- [x] 送信・キャンセルボタン

#### セクション編集
- [x] 既存セクションの編集フォーム
- [x] インライン編集またはモーダル

#### セクション削除
- [x] 削除ボタン
- [x] 確認ダイアログ
- [x] セクション内のレッスンも削除される警告表示

#### セクション並び替え
- [x] ドラッグ&ドロップでセクションの順序を変更
- [x] `dnd-kit` または `react-beautiful-dnd` ライブラリを使用
- [x] 順序変更時に `order` フィールドを更新

```typescript
'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function SectionList({ sections }: { sections: Section[] }) {
  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      // 順序を更新
      await reorderSections(active.id, over.id)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections} strategy={verticalListSortingStrategy}>
        {sections.map((section) => (
          <SortableSection key={section.id} section={section} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### レッスン管理

#### レッスン作成フォーム
- [x] `app/_components/admin/LessonForm.tsx` を作成
- [x] モーダルまたはインラインフォーム
- [x] フィールド
  - [x] レッスンタイトル（必須）
  - [x] レッスン説明文
  - [x] YouTube動画ID（必須）
  - [x] YouTube動画IDのバリデーション
- [x] YouTube動画プレビュー（入力時に表示）

```typescript
'use client'

export function LessonForm({ sectionId }: { sectionId: string }) {
  const [videoId, setVideoId] = useState('')

  return (
    <form>
      <input
        type="text"
        placeholder="YouTube動画ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      {videoId && (
        <div className="mt-4">
          <p className="text-sm mb-2">プレビュー:</p>
          <div className="relative aspect-video max-w-md">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      )}
      {/* その他のフィールド */}
    </form>
  )
}
```

#### レッスン編集
- [x] 既存レッスンの編集フォーム
- [x] インライン編集またはモーダル

#### レッスン削除
- [x] 削除ボタン
- [x] 確認ダイアログ

#### レッスン並び替え
- [x] セクション内でドラッグ&ドロップでレッスンの順序を変更
- [x] 順序変更時に `order` フィールドを更新

### Server Actions

#### セクション作成
- [x] `app/actions/admin/sections.ts` ファイルを作成
- [x] `createSection` Server Action実装
- [x] セクションの `order` を自動設定（既存セクション数 + 1）

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createSection(courseId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string

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
```

#### セクション更新
- [x] `updateSection` Server Action実装

#### セクション削除
- [x] `deleteSection` Server Action実装
- [x] カスケード削除でレッスンも削除

#### セクション並び替え
- [x] `reorderSections` Server Action実装
- [x] セクションの `order` フィールドを一括更新

```typescript
export async function reorderSections(courseId: string, sectionOrders: { id: string; order: number }[]) {
  await requireAdmin()

  const supabase = await createClient()

  // 各セクションの順序を更新
  for (const { id, order } of sectionOrders) {
    await supabase.from('sections').update({ order }).eq('id', id)
  }

  revalidatePath(`/admin/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)

  return { success: true }
}
```

#### レッスン作成
- [x] `app/actions/admin/lessons.ts` ファイルを作成
- [x] `createLesson` Server Action実装
- [x] YouTube動画IDのバリデーション
- [x] レッスンの `order` を自動設定

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createLesson(sectionId: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const youtube_video_id = formData.get('youtube_video_id') as string

  // YouTube動画IDのバリデーション（11文字の英数字）
  if (!/^[a-zA-Z0-9_-]{11}$/.test(youtube_video_id)) {
    throw new Error('無効なYouTube動画IDです')
  }

  const supabase = await createClient()

  // 既存レッスン数を取得
  const { count } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('section_id', sectionId)

  const order = (count || 0) + 1

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      section_id: sectionId,
      title,
      description,
      youtube_video_id,
      order,
    })
    .select()
    .single()

  if (error) throw error

  // courseIdを取得してrevalidate
  const { data: section } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', sectionId)
    .single()

  if (section) {
    revalidatePath(`/admin/courses/${section.course_id}/edit`)
    revalidatePath(`/courses/${section.course_id}`)
  }

  return data
}
```

#### レッスン更新
- [x] `updateLesson` Server Action実装

#### レッスン削除
- [x] `deleteLesson` Server Action実装

#### レッスン並び替え
- [x] `reorderLessons` Server Action実装

### エラーハンドリング
- [x] YouTube動画IDの検証
- [x] 削除時の確認
- [x] エラーメッセージ表示

### 楽観的UI更新
- [x] 並び替え時に即座にUIを更新
- [x] Server Actionの完了を待つ

## 関連ファイル
- `app/admin/courses/[courseId]/edit/page.tsx`
- `app/_components/admin/CurriculumEditor.tsx`
- `app/_components/admin/SectionForm.tsx`
- `app/_components/admin/LessonForm.tsx`
- `app/actions/admin/sections.ts`
- `app/actions/admin/lessons.ts`

## 参考情報
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [YouTube Video ID Format](https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video)

## 完了条件
- [x] セクションの作成・編集・削除が正しく機能する
- [x] レッスンの作成・編集・削除が正しく機能する
- [x] セクションとレッスンの並び替えが機能する
- [x] YouTube動画IDの検証が機能する
- [x] YouTube動画プレビューが表示される
- [x] 管理者のみアクセス可能

# 005: 講座詳細ページ

## 概要
講座の詳細情報、カリキュラム構成、進捗状況を表示するページを実装する。

## フェーズ
フェーズ2: 一般ユーザー機能

## タスク

### ページルーティング
- [x] `app/courses/[courseId]/page.tsx` ファイルを作成
- [x] 動的ルートパラメータ `courseId` を取得

### データ取得

#### 講座データ取得
- [x] Server Componentでコース詳細を取得
- [x] セクションとレッスンを含めて取得（ネストしたクエリ）
- [x] カテゴリとタグも取得

```typescript
const { data: course } = await supabase
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
```

#### 進捗データ取得
- [x] 認証ユーザーの進捗データを取得
- [x] レッスンごとの完了状態を取得

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  const { data: progress } = await supabase
    .from('progress')
    .select('lesson_id, completed')
    .eq('user_id', user.id)
}
```

### UI実装

#### 講座ヘッダー
- [x] 講座タイトル表示
- [x] 講座説明文表示
- [x] サムネイル画像表示
- [x] カテゴリバッジ表示
- [x] タグ表示

#### 進捗表示
- [x] 全体の進捗率を計算（完了レッスン数 / 総レッスン数）
- [x] 進捗バー表示
- [x] 進捗率テキスト表示（例: 5/30レッスン完了 17%）

#### カリキュラム表示
- [x] `app/_components/course/Curriculum.tsx` コンポーネント作成
- [x] セクションごとにレッスンをグループ化して表示
- [x] アコーディオンUIでセクションを展開/折りたたみ
- [x] 各レッスンの視聴状態アイコン表示（✓ 完了 / ○ 未視聴）
- [x] レッスンタイトルとレッスン視聴ページへのリンク

#### アクセス制御表示
- [x] 未認証ユーザー: 最初のレッスンのみアクセス可能と表示
- [x] 2つ目以降のレッスンに鍵アイコン表示
- [x] 「ログインしてすべてのレッスンを視聴」CTAボタン表示

#### 最初のレッスンへのCTA
- [x] 「学習を始める」ボタン追加
- [x] 最初のレッスンへのリンク

### レスポンシブレイアウト
- [x] デスクトップ: サイドバーにカリキュラム、メインエリアに詳細
- [x] モバイル: カリキュラムをアコーディオンで下部に配置

### Loading状態
- [x] `app/courses/[courseId]/loading.tsx` を作成
- [x] スケルトンローディングUI実装

### エラーハンドリング
- [x] `app/courses/[courseId]/error.tsx` を作成
- [x] 講座が見つからない場合のエラー表示

### Not Found処理
- [x] `app/courses/[courseId]/not-found.tsx` を作成
- [x] 404ページ実装

### Metadata設定
- [x] `generateMetadata` 関数を実装
- [x] 動的にページタイトルを設定（講座タイトル）
- [x] 動的に説明文を設定（講座説明）
- [x] OGP画像を講座サムネイルに設定

```typescript
export async function generateMetadata({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId)

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      images: [course.thumbnail_url],
    },
  }
}
```

## 関連ファイル
- `app/courses/[courseId]/page.tsx`
- `app/courses/[courseId]/loading.tsx`
- `app/courses/[courseId]/error.tsx`
- `app/courses/[courseId]/not-found.tsx`
- `app/_components/course/Curriculum.tsx`
- `app/_components/course/ProgressBar.tsx`

## 参考情報
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

## 完了条件
- [x] 講座詳細が正しく表示される
- [x] カリキュラムがセクション・レッスン階層で表示される
- [x] 進捗率が正しく計算され表示される
- [x] 未認証ユーザーへのアクセス制御表示が機能する
- [x] レスポンシブデザインが正しく機能する
- [x] 動的メタデータが正しく設定される

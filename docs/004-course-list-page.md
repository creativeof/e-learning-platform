# 004: 講座一覧ページ

## 概要
すべての講座を一覧表示し、カテゴリやタグでフィルタリングできるページを実装する。

## フェーズ
フェーズ2: 一般ユーザー機能

## タスク

### ページルーティング
- [x] `app/courses/page.tsx` ファイルを作成
- [x] トップページ (`app/page.tsx`) から講座一覧へのリンクを追加

### データ取得
- [x] Server Componentでコース一覧を取得
- [x] カテゴリ情報を含めて取得（JOIN）
- [x] タグ情報を含めて取得（course_tags経由）

```typescript
const supabase = await createClient()
const { data: courses } = await supabase
  .from('courses')
  .select(`
    *,
    category:categories(*),
    course_tags(tag:tags(*))
  `)
  .order('created_at', { ascending: false })
```

### UI実装

#### 講座カードコンポーネント
- [x] `app/_components/course/CourseCard.tsx` を作成
- [x] サムネイル画像表示（Next.js Image コンポーネント使用）
- [x] 講座タイトル表示
- [x] 講座説明文表示（短縮版）
- [x] カテゴリバッジ表示
- [x] タグ表示
- [x] 講座詳細ページへのリンク

#### 講座一覧レイアウト
- [x] グリッドレイアウトで講座カードを配置
- [x] レスポンシブ対応（モバイル: 1列、タブレット: 2列、デスクトップ: 3列）

### フィルタリング機能

#### カテゴリフィルタ
- [x] カテゴリ一覧を取得
- [x] カテゴリフィルタUIコンポーネント作成
- [x] URLパラメータでカテゴリIDを管理 (`?category=xxx`)
- [x] 選択されたカテゴリで講座をフィルタリング

#### タグフィルタ
- [ ] タグ一覧を取得
- [ ] タグフィルタUIコンポーネント作成
- [ ] URLパラメータでタグIDを管理 (`?tag=xxx`)
- [ ] 選択されたタグで講座をフィルタリング

#### フィルタのクリア
- [x] 「すべて表示」ボタンを追加
- [x] フィルタをクリアして全講座を表示

### Loading状態
- [x] `app/courses/loading.tsx` を作成
- [x] スケルトンローディングUIを実装

### エラーハンドリング
- [x] `app/courses/error.tsx` を作成
- [x] エラーメッセージ表示
- [x] 再試行ボタン追加

### Metadata設定
- [x] ページタイトル設定
- [x] ページ説明文設定
- [ ] OGP画像設定（オプション）

### スタイリング
- [x] Tailwind CSSでスタイリング
- [x] ホバーエフェクト追加
- [x] カードシャドウ・ボーダー設定
- [x] ダークモード対応

## 関連ファイル
- `app/courses/page.tsx`
- `app/courses/loading.tsx`
- `app/courses/error.tsx`
- `app/_components/course/CourseCard.tsx`
- `app/_components/course/CategoryFilter.tsx`
- `app/_components/course/TagFilter.tsx`

## 参考情報
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Supabase Query Patterns](https://supabase.com/docs/guides/database/joins-and-nested-tables)

## 完了条件
- [x] 講座一覧が正しく表示される
- [x] カテゴリフィルタが動作する
- [ ] タグフィルタが動作する
- [x] レスポンシブデザインが正しく機能する
- [x] Loading状態が表示される
- [x] エラーハンドリングが機能する

# 014: パフォーマンス最適化

## 概要
ページ読み込み速度を向上させ、ユーザーエクスペリエンスを最適化する。

## フェーズ
フェーズ4: 最終調整

## タスク

### 画像最適化

#### Next.js Image コンポーネント
- [x] すべての画像で `next/image` の `<Image>` コンポーネントを使用
- [x] `width` と `height` を適切に指定
- [x] Above the fold の画像に `priority` 属性を追加
- [x] サムネイル画像に適切なサイズを指定

```typescript
<Image
  src={course.thumbnail_url}
  alt={course.title}
  width={400}
  height={300}
  className="rounded-lg"
  priority // Above the fold の場合のみ
/>
```

#### 画像フォーマット
- [x] WebP形式の使用を検討
- [x] 適切な画像サイズ（不要に大きい画像を避ける）

### YouTube動画の遅延読み込み

#### 動的インポート
- [x] YouTubePlayerコンポーネントを動的インポート
- [x] `ssr: false` でクライアントサイドのみでレンダリング

```typescript
import dynamic from 'next/dynamic'

const YouTubePlayer = dynamic(() => import('@/app/_components/lesson/YouTubePlayer'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
})
```

#### iframe loading属性
- [x] iframe に `loading="lazy"` 属性を追加

### データフェッチングの最適化

#### 並列データ取得
- [x] 複数のデータ取得を `Promise.all` で並列化

```typescript
const [courses, categories, tags] = await Promise.all([
  supabase.from('courses').select('*'),
  supabase.from('categories').select('*'),
  supabase.from('tags').select('*'),
])
```

#### 必要なデータのみ取得
- [x] `select()` で必要なカラムのみ取得
- [x] JOIN する際に不要なデータを含めない

#### Suspense境界の活用
- [ ] データフェッチングを分割してSuspenseで囲む
- [ ] 重要なコンテンツを先に表示

```typescript
<Suspense fallback={<HeaderSkeleton />}>
  <CourseHeader courseId={courseId} />
</Suspense>
<Suspense fallback={<CurriculumSkeleton />}>
  <CourseCurriculum courseId={courseId} />
</Suspense>
```

### キャッシング戦略

#### 静的データのキャッシュ
- [ ] カテゴリ・タグなど変更頻度の低いデータをキャッシュ
- [ ] `revalidate` オプションで適切な再検証時間を設定

#### revalidatePath の適切な使用
- [ ] データ更新時に関連パスを再検証
- [ ] 不要な再検証を避ける

### フォント最適化

#### next/font の活用
- [ ] すでに `next/font` を使用していることを確認（チケット003で実装済み）
- [ ] フォントのサブセットを適切に設定
- [ ] `display: 'swap'` でフォント読み込み中もテキストを表示

### JavaScript バンドルサイズの最適化

#### 動的インポート
- [x] 大きなコンポーネントを動的インポート
- [x] ルートごとのコード分割が適切に機能していることを確認

#### Tree Shaking
- [x] 未使用のインポートを削除
- [x] ESLint で未使用コードを検出

```bash
npm run lint
```

#### Bundle Analyzer（オプション）
- [ ] `@next/bundle-analyzer` をインストール
- [ ] バンドルサイズを分析
- [ ] 大きな依存関係を特定して最適化

```bash
npm install @next/bundle-analyzer
```

### Server Components の活用
- [x] データフェッチングは可能な限りServer Componentで実行
- [x] Client Componentは必要最小限に

### Metadata の最適化
- [x] すべてのページで適切な `<title>` と `<description>` を設定
- [ ] OGP画像を設定
- [ ] favicon を最適化

### Core Web Vitals の確認

#### LCP (Largest Contentful Paint) - 目標: 2.5秒以下
- [x] 画像の最適化
- [x] フォントの最適化
- [x] Server Componentsでのデータフェッチング

#### FID (First Input Delay) - 目標: 100ms以下
- [x] JavaScriptの実行時間を短縮
- [x] 長時間実行タスクを分割

#### CLS (Cumulative Layout Shift) - 目標: 0.1以下
- [x] 画像に `width` と `height` を指定
- [x] フォント読み込み時のレイアウトシフトを防ぐ
- [x] 広告やiframeにスペースを予約

### パフォーマンス測定

#### Lighthouse
- [ ] Chrome DevToolsでLighthouseを実行
- [ ] Performance スコアを確認（目標: 90以上）
- [ ] Accessibility スコアを確認（目標: 90以上）
- [ ] Best Practices スコアを確認（目標: 90以上）
- [ ] SEO スコアを確認（目標: 90以上）

#### PageSpeed Insights
- [ ] https://pagespeed.web.dev/ でテスト
- [ ] モバイルとデスクトップ両方で確認

#### WebPageTest（オプション）
- [ ] https://www.webpagetest.org/ でテスト
- [ ] さまざまな地域・デバイスでの読み込み速度を確認

### Next.js の設定最適化

#### next.config.ts
- [x] 画像の最適化設定を確認
- [x] 圧縮設定を確認

```typescript
const nextConfig = {
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  compress: true,
}
```

### データベースクエリの最適化
- [x] N+1問題がないか確認
- [x] インデックスが適切に設定されているか確認（Supabase側）
- [x] 不要なJOINを削除

### エラーバウンダリーの実装
- [x] すべての主要ページで `error.tsx` が実装されている
- [x] エラーが適切にキャッチされる

## 関連ファイル
- `next.config.ts`
- すべてのページコンポーネント
- `app/_components/**/*`

## 参考情報
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## 完了条件
- [ ] Lighthouse Performance スコアが90以上
- [ ] ページ読み込み時間が3秒以内
- [ ] Core Web Vitals がすべて良好
- [ ] 画像が最適化されている
- [ ] JavaScriptバンドルサイズが適切

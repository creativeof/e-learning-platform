# 開発チケット一覧

このディレクトリには、YouTube動画講座プラットフォームMVPの開発チケットが含まれています。

## チケット管理方法

各チケットファイルには、タスクリストがチェックボックス形式で記載されています。
タスクが完了したら、`[ ]` を `[x]` に変更してください。

例:
```markdown
- [ ] 未完了のタスク
- [x] 完了したタスク
```

## フェーズ別チケット一覧

### フェーズ1: 基盤構築

- [001: Supabaseプロジェクト作成とDB設計](./001-supabase-project-setup.md)
  - Supabaseプロジェクトの作成
  - データベーステーブルの作成
  - RLSポリシーの設定
  - トリガー関数の作成

- [002: Supabase Auth（Google OAuth）設定](./002-supabase-auth-setup.md)
  - Google Cloud Console設定
  - Supabase Auth設定
  - OAuth リダイレクトURL設定

- [003: Next.jsとSupabaseの統合](./003-nextjs-supabase-integration.md)
  - パッケージインストール
  - Supabaseクライアント作成（Client/Server Component用）
  - Middleware実装
  - 認証コールバックルート作成

### フェーズ2: 一般ユーザー機能

- [004: 講座一覧ページ](./004-course-list-page.md)
  - 講座一覧表示
  - カテゴリ・タグフィルタリング
  - レスポンシブデザイン

- [005: 講座詳細ページ](./005-course-detail-page.md)
  - 講座詳細情報表示
  - カリキュラム表示
  - 進捗率表示
  - アクセス制御表示

- [006: レッスン視聴ページ](./006-lesson-viewer-page.md)
  - YouTube動画埋め込み
  - レッスン情報表示
  - 完了ボタン
  - 前後レッスンナビゲーション

- [007: 進捗管理機能](./007-progress-tracking.md)
  - Server Actions（レッスン完了/未完了マーク）
  - 進捗率計算
  - マイページ（受講中の講座）

- [008: 認証フロー](./008-authentication-flow.md)
  - ログインページ
  - ログアウト機能
  - ユーザーメニュー
  - ヘッダーナビゲーション
  - プロテクテッドルート

### フェーズ3: 管理者機能

- [009: 管理画面ダッシュボード](./009-admin-dashboard.md)
  - 管理者権限チェック
  - 管理画面レイアウト
  - ダッシュボード統計表示

- [010: 管理画面 - 講座CRUD](./010-admin-course-crud.md)
  - 講座一覧ページ
  - 講座作成・編集・削除
  - Server Actions

- [011: 管理画面 - セクション・レッスンCRUD](./011-admin-section-lesson-crud.md)
  - カリキュラム管理コンポーネント
  - セクション・レッスン作成・編集・削除
  - ドラッグ&ドロップでの並び替え

- [012: 管理画面 - カテゴリ・タグ管理](./012-admin-category-tag-management.md)
  - カテゴリ管理ページ
  - タグ管理ページ
  - 作成・編集・削除

### フェーズ4: 最終調整

- [013: レスポンシブ対応確認](./013-responsive-design.md)
  - デバイス別の確認（モバイル・タブレット・デスクトップ）
  - タッチ操作の最適化
  - 実機テスト

- [014: パフォーマンス最適化](./014-performance-optimization.md)
  - 画像最適化
  - YouTube動画の遅延読み込み
  - データフェッチングの最適化
  - Core Web Vitals の確認

- [015: デプロイ準備](./015-deployment.md)
  - 環境変数の整理
  - Vercelプロジェクトの作成
  - 本番環境での動作確認
  - セキュリティチェック

## 開発の進め方

1. 各フェーズを順番に進めることを推奨します
2. フェーズ1の完了後、フェーズ2に進んでください
3. 各チケット内のタスクを上から順に実装してください
4. 完了したタスクは `[x]` にマークしてください
5. 問題が発生した場合は、関連する参考情報を確認してください

## 完了基準

各チケットの最後に「完了条件」が記載されています。
すべての完了条件を満たしてから次のチケットに進んでください。

## 参考資料

- [CLAUDE.md](../CLAUDE.md) - プロジェクト全体のアーキテクチャと技術仕様
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

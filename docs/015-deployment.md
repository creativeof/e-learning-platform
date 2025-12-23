# 015: デプロイ準備

## 概要
Vercelへのデプロイ準備を行い、本番環境で正しく動作することを確認する。

## フェーズ
フェーズ4: 最終調整

## タスク

### 環境変数の整理

#### .env.local の確認
- [ ] すべての必要な環境変数が設定されている
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### .env.example の作成
- [ ] `.env.example` ファイルを作成
- [ ] 環境変数のキーのみ記載（値は空）

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

#### .gitignore の確認
- [ ] `.env.local` が .gitignore に含まれている
- [ ] `.env` ファイルが .gitignore に含まれている

### Vercelプロジェクトの作成

#### Vercelアカウント
- [ ] Vercelアカウントを作成（または既存アカウントを使用）
- [ ] GitHubアカウントと連携

#### プロジェクトのインポート
- [ ] Vercelダッシュボードで「New Project」
- [ ] GitHubリポジトリを選択
- [ ] プロジェクト名を設定

#### 環境変数の設定
- [ ] Vercelダッシュボードで「Environment Variables」に移動
- [ ] `NEXT_PUBLIC_SUPABASE_URL` を追加
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` を追加
- [ ] すべての環境（Production, Preview, Development）で有効化

### Supabaseの本番設定

#### URLの許可リスト
- [ ] Supabase Dashboard → Authentication → URL Configuration
- [ ] Vercelのデプロイ先URL を「Site URL」に設定
- [ ] Vercelの本番ドメインを「Redirect URLs」に追加

```
https://your-domain.vercel.app/auth/callback
```

#### CORS設定
- [ ] 必要に応じてSupabaseのCORS設定を確認

### ビルドの確認

#### ローカルで本番ビルド
- [ ] `npm run build` を実行
- [ ] ビルドエラーがないことを確認
- [ ] TypeScriptエラーがないことを確認

```bash
npm run build
```

#### ビルド成功の確認
- [ ] `.next` ディレクトリが生成される
- [ ] エラーログがない

#### 本番モードでローカル確認
- [ ] `npm run start` を実行
- [ ] http://localhost:3000 で動作確認

```bash
npm run start
```

### デプロイの実行

#### 初回デプロイ
- [ ] Vercelダッシュボードで「Deploy」ボタンをクリック
- [ ] ビルドログを確認
- [ ] デプロイが成功することを確認

#### デプロイ先URLの確認
- [ ] デプロイ完了後、本番URLにアクセス
- [ ] すべてのページが正しく表示されることを確認

### 本番環境での動作確認

#### 一般ユーザー機能
- [ ] 講座一覧ページが表示される
- [ ] 講座詳細ページが表示される
- [ ] レッスン視聴ページが表示される
- [ ] YouTube動画が再生できる
- [ ] Googleログインが機能する
- [ ] ログアウトが機能する
- [ ] 進捗管理が機能する
- [ ] マイページが表示される

#### 管理者機能
- [ ] 管理画面にアクセスできる（管理者アカウントで）
- [ ] 講座の作成・編集・削除が機能する
- [ ] セクション・レッスンの作成・編集・削除が機能する
- [ ] カテゴリ・タグの管理が機能する

#### 認証
- [ ] Google OAuthが本番環境で機能する
- [ ] セッション管理が正しく機能する
- [ ] ログイン・ログアウトが正常に動作する

#### データベース
- [ ] Supabaseへの接続が正常
- [ ] データの取得・更新・削除が正常に機能する
- [ ] RLSポリシーが正しく適用される

### カスタムドメインの設定（オプション）

#### ドメインの追加
- [ ] Vercelダッシュボードで「Domains」に移動
- [ ] カスタムドメインを追加
- [ ] DNSレコードを設定

#### SSL証明書
- [ ] Vercelが自動的にSSL証明書を発行することを確認
- [ ] HTTPS接続が機能することを確認

#### Supabaseの設定更新
- [ ] カスタムドメインを Supabase の「Redirect URLs」に追加

### モニタリング・ログ

#### Vercel Analytics（オプション）
- [ ] Vercel Analyticsを有効化
- [ ] Web Vitalsを監視

#### エラートラッキング（オプション）
- [ ] Sentryなどのエラートラッキングサービスを導入
- [ ] エラーログを監視

### パフォーマンスチェック
- [ ] Lighthouse で本番環境を測定
- [ ] PageSpeed Insights で本番URLをテスト
- [ ] Core Web Vitals が良好

### セキュリティチェック
- [ ] 環境変数が正しく設定されている（漏洩していない）
- [ ] APIキーが公開されていない
- [ ] RLSポリシーが正しく機能している
- [ ] 管理者権限が正しくチェックされている

### ドキュメント更新

#### README.md
- [ ] プロジェクト概要を記載
- [ ] セットアップ手順を記載
- [ ] 環境変数の説明を記載
- [ ] デプロイ手順を記載

#### CLAUDE.md
- [ ] デプロイ情報を追加（必要に応じて）

### Gitタグの作成
- [ ] v1.0.0 などのバージョンタグを作成

```bash
git tag -a v1.0.0 -m "First production release"
git push origin v1.0.0
```

### 継続的デプロイ（CI/CD）
- [ ] mainブランチへのプッシュで自動デプロイされることを確認
- [ ] プルリクエストでプレビューデプロイが作成されることを確認

## 関連ファイル
- `.env.example`
- `.gitignore`
- `README.md`
- `CLAUDE.md`
- Vercel設定
- Supabase設定

## 参考情報
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

## 完了条件
- [ ] Vercelへのデプロイが成功している
- [ ] 本番環境ですべての機能が正常に動作する
- [ ] Google OAuthが本番環境で機能する
- [ ] 環境変数が正しく設定されている
- [ ] パフォーマンスが良好
- [ ] セキュリティチェックが完了している
- [ ] ドキュメントが整備されている

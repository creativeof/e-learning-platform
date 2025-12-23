# 002: Supabase Auth（Google OAuth）設定

## 概要
Supabase AuthでGoogle OAuthを設定し、認証機能を有効化する。

## フェーズ
フェーズ1: 基盤構築

## タスク

### Google Cloud Console設定
- [x] Google Cloud Consoleにアクセス
- [x] 新規プロジェクト作成（または既存プロジェクト選択）
- [x] OAuth 2.0 認証情報を作成
  - [x] 承認済みのリダイレクトURIを設定（SupabaseのコールバックURL）
  - [x] クライアントIDとクライアントシークレットを取得

### Supabase Auth設定
- [x] Supabase Dashboardで Authentication → Providers に移動
- [x] Google Providerを有効化
- [x] Google Client IDを入力
- [x] Google Client Secretを入力
- [x] 設定を保存

### OAuth リダイレクトURL設定
- [x] Supabaseのコールバック URL を確認（`https://<project-ref>.supabase.co/auth/v1/callback`）
- [x] Google Cloud ConsoleのOAuth設定に上記URLを追加
- [x] 開発環境用のリダイレクトURLも追加（`http://localhost:3000/auth/callback`）

### 認証フロー確認
- [x] Supabase Dashboardから認証テストを実行
- [x] Googleログインが正常に動作することを確認
- [x] ユーザー情報が `auth.users` テーブルに保存されることを確認
- [x] `profiles` テーブルにレコードが自動作成されることを確認（トリガー関数が動作）

### Email テンプレート設定（オプション）
- [ ] Authentication → Email Templates でテンプレートを確認
- [ ] 必要に応じてカスタマイズ

## 関連ファイル
- Supabase Dashboard設定
- Google Cloud Console設定

## 参考情報
- [Supabase Auth - Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)

## 完了条件
- [x] Google OAuthが正しく設定されている
- [x] テストユーザーでログインできることを確認
- [x] ユーザー登録時に `profiles` テーブルにレコードが自動作成される

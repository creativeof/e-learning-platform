# 001: Supabaseプロジェクト作成とDB設計

## 概要
Supabaseプロジェクトを作成し、データベーススキーマを設計・実装する。

## フェーズ
フェーズ1: 基盤構築

## タスク

### Supabaseプロジェクト作成
- [x] プロジェクトURL と ANON KEY を取得
- [x] `.env.local` ファイルに環境変数を設定

### データベーステーブル作成

#### profilesテーブル
- [x] `profiles` テーブル作成
  - `id` (uuid, primary key, references auth.users)
  - `display_name` (text)
  - `avatar_url` (text)
  - `role` (text, default 'user')
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

#### coursesテーブル
- [x] `courses` テーブル作成
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `thumbnail_url` (text)
  - `category_id` (uuid, foreign key)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

#### sectionsテーブル
- [x] `sections` テーブル作成
  - `id` (uuid, primary key)
  - `course_id` (uuid, foreign key)
  - `title` (text)
  - `description` (text)
  - `order` (integer)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

#### lessonsテーブル
- [x] `lessons` テーブル作成
  - `id` (uuid, primary key)
  - `section_id` (uuid, foreign key)
  - `title` (text)
  - `description` (text)
  - `youtube_video_id` (text)
  - `order` (integer)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

#### progressテーブル
- [x] `progress` テーブル作成
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `lesson_id` (uuid, foreign key)
  - `completed` (boolean)
  - `completed_at` (timestamp)
  - `created_at` (timestamp)
  - UNIQUE constraint on (user_id, lesson_id)

#### categoriesテーブル
- [x] `categories` テーブル作成
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `description` (text)
  - `created_at` (timestamp)

#### tagsテーブル
- [x] `tags` テーブル作成
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `created_at` (timestamp)

#### course_tagsテーブル（中間テーブル）
- [x] `course_tags` テーブル作成
  - `course_id` (uuid, foreign key)
  - `tag_id` (uuid, foreign key)
  - PRIMARY KEY (course_id, tag_id)

### Row Level Security (RLS) 設定
- [x] すべてのテーブルでRLSを有効化
- [x] `profiles` テーブルのRLSポリシー作成
- [x] `courses` テーブルのRLSポリシー作成（読み取りは全員、書き込みは管理者のみ）
- [x] `sections` テーブルのRLSポリシー作成
- [x] `lessons` テーブルのRLSポリシー作成
- [x] `progress` テーブルのRLSポリシー作成（自分のデータのみ読み書き可能）
- [x] `categories` テーブルのRLSポリシー作成
- [x] `tags` テーブルのRLSポリシー作成
- [x] `course_tags` テーブルのRLSポリシー作成

### トリガー関数作成
- [x] `profiles` レコード自動作成トリガー関数を作成
- [x] ユーザー登録時に自動的に `profiles` レコードが作成されることを確認

## 関連ファイル
- `.env.local`
- `CLAUDE.md` (データベーススキーマセクション)

## 参考情報
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 完了条件
- [x] すべてのテーブルが作成され、適切な制約が設定されている
- [x] RLSポリシーが正しく設定され、セキュリティが確保されている
- [x] テストデータを挿入して、テーブル間のリレーションが正しく機能することを確認

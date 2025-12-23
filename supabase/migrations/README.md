# Database Migrations

このディレクトリにはSupabaseデータベースのマイグレーションファイルが含まれています。

## マイグレーションの適用方法

### 方法1: Supabase CLI（推奨）

```bash
# Supabase CLIをインストール（まだの場合）
npm install -g supabase

# プロジェクトとリンク
supabase link --project-ref <your-project-ref>

# マイグレーションを適用
supabase db push
```

### 方法2: Supabase Dashboard

1. Supabase Dashboardにログイン
2. プロジェクトを選択
3. **Database** > **SQL Editor** に移動
4. マイグレーションファイルの内容をコピー＆ペースト
5. **Run** をクリック

## 利用可能なマイグレーション

### 20231223_enable_rls_policies.sql

**目的:** すべてのテーブルでRow Level Security (RLS)を有効化し、適切なアクセス制御ポリシーを設定します。

**影響範囲:**
- profiles
- progress
- courses
- sections
- lessons
- categories
- tags
- course_tags

**ポリシーの概要:**
- **公開読み取り:** courses, sections, lessons, categories, tags, course_tags
- **ユーザー自身のデータのみ:** progress
- **管理者のみ書き込み:** courses, sections, lessons, categories, tags

**重要:** このマイグレーションを適用後、必ずアプリケーションの動作を確認してください。

## トラブルシューティング

### マイグレーション適用後にデータが表示されない

RLSポリシーが厳しすぎる可能性があります。以下を確認：

```sql
-- 現在のポリシーを確認
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';

-- 一時的にポリシーを無効化してテスト（本番環境では非推奨）
ALTER TABLE your_table_name DISABLE ROW LEVEL SECURITY;
```

### 管理者がコンテンツを作成できない

profiles.role が正しく設定されているか確認：

```sql
-- 自分のプロファイルを確認
SELECT id, role FROM profiles WHERE id = auth.uid();

-- 管理者権限を付与（必要に応じて）
UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
```

## ベストプラクティス

1. **本番環境への適用前にステージング環境でテスト**
2. **マイグレーションファイルは削除せず、履歴として保持**
3. **ロールバックが必要な場合に備えて、逆マイグレーションを作成**
4. **大きな変更は複数のマイグレーションに分割**

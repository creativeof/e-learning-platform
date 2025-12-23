# 開発コマンド

## 日常的な開発
```bash
# 開発サーバー起動 (http://localhost:3000)
npm run dev

# Lint実行
npm run lint
```

## ビルド・デプロイ
```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

## Git操作（Darwin/macOS標準）
```bash
# 変更確認
git status

# コミット
git add .
git commit -m "commit message"

# プッシュ
git push
```

## ファイル操作（Darwin/macOS標準）
```bash
# ディレクトリ一覧
ls -la

# ファイル検索
find . -name "*.tsx"

# ファイル内容検索
grep -r "pattern" .

# ディレクトリ移動
cd path/to/directory
```

## Supabase関連
```bash
# マイグレーション実行（Supabase Dashboardまたはツール経由）
# RLS（Row Level Security）は必ず有効化
```

## 注意事項
- 開発サーバーはホットリロード対応
- ESLintエラーはビルド前に解消すること
- TypeScriptの型エラーは厳密にチェックされる

# 視聴履歴機能のセットアップ手順

## エラーの原因
`video_watch_history`テーブルがSupabaseデータベースに存在しないため、視聴履歴の記録ができません。

## 解決方法

### 1. Supabaseダッシュボードにアクセス
1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. プロジェクトを選択

### 2. SQLエディタでテーブルを作成
1. 左側のメニューから「SQL Editor」をクリック
2. 「New query」をクリック
3. `supabase-setup-watch-history.sql`の内容をコピー＆ペースト
4. 「Run」ボタンをクリックして実行

### 3. テーブルが作成されたことを確認
1. 左側のメニューから「Table Editor」をクリック
2. `video_watch_history`テーブルが表示されることを確認

### 4. アプリケーションを再起動
```bash
# Ctrl+C でサーバーを停止
npm run dev
```

## テーブル構造

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| video_id | BIGINT | 動画ID |
| user_id | UUID | ユーザーID |
| started_at | TIMESTAMP | 視聴開始日時 |
| completed_at | TIMESTAMP | 視聴完了日時 |
| is_completed | BOOLEAN | 視聴完了フラグ |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

## セキュリティポリシー（RLS）

- ユーザーは自分の視聴履歴のみ読み書き可能
- 組織管理者は組織内の全ユーザーの視聴履歴を閲覧可能

## 動作確認

1. 動画ページで動画を最後まで再生
2. 「動画の視聴が完了しました！」というアラートが表示される
3. コースページまたはマニュアルページで「視聴済み」バッジが表示される
4. テストページで受験結果一覧に自分の名前が表示される

## トラブルシューティング

### エラーが続く場合
1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
2. 開発サーバーを再起動
3. Supabaseのテーブルエディタで`video_watch_history`テーブルが存在することを確認
4. RLSポリシーが正しく設定されていることを確認











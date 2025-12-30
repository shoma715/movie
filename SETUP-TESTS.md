# テスト機能のセットアップ手順

## 概要
テスト作成・管理機能を使用するために必要なデータベーステーブルをセットアップします。

## 📋 機能一覧

### 実装済み機能
- ✅ テスト作成ページ（組織管理者のみ）
- ✅ テスト一覧ページ
- ✅ テスト削除機能（組織管理者のみ）
- ✅ 2択〜4択の選択肢
- ✅ 単一選択・複数選択の切り替え
- ✅ 動画との紐付け
- ✅ 組織ごとのテスト管理

### 今後実装予定
- ⏳ テスト編集機能
- ⏳ テスト受験機能（一般ユーザー）
- ⏳ テスト結果の集計・表示
- ⏳ テスト受験履歴の管理

## 🗄️ データベーステーブル構成

### 1. `tests` テーブル
テストのマスター情報を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| title | VARCHAR(255) | テストタイトル |
| video_id | BIGINT | 紐付ける動画ID |
| organization | VARCHAR(100) | 組織名 |
| created_by | UUID | 作成者ユーザーID |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### 2. `test_questions` テーブル
テストの問題を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| test_id | BIGINT | テストID（外部キー） |
| question_order | INTEGER | 問題の順序 |
| question_text | TEXT | 問題文 |
| question_type | VARCHAR(20) | 問題タイプ（single/multiple） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### 3. `test_choices` テーブル
問題の選択肢を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| question_id | BIGINT | 問題ID（外部キー） |
| choice_order | INTEGER | 選択肢の順序 |
| choice_text | TEXT | 選択肢テキスト |
| is_correct | BOOLEAN | 正解フラグ |
| created_at | TIMESTAMP | 作成日時 |

### 4. `test_attempts` テーブル
テスト受験履歴を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| test_id | BIGINT | テストID（外部キー） |
| user_id | UUID | ユーザーID |
| score | DECIMAL(5,2) | 得点 |
| max_score | DECIMAL(5,2) | 最大得点 |
| started_at | TIMESTAMP | 開始日時 |
| completed_at | TIMESTAMP | 完了日時 |
| is_completed | BOOLEAN | 完了フラグ |
| created_at | TIMESTAMP | 作成日時 |

### 5. `test_answers` テーブル
テストの回答を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGSERIAL | 主キー |
| attempt_id | BIGINT | 受験履歴ID（外部キー） |
| question_id | BIGINT | 問題ID（外部キー） |
| choice_id | BIGINT | 選択肢ID（外部キー） |
| created_at | TIMESTAMP | 作成日時 |

## 🚀 セットアップ手順

### 手順1: Supabaseでテーブルを作成

1. **Supabaseダッシュボードにアクセス**
   - https://app.supabase.com/ にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左側のメニューから「SQL Editor」をクリック
   - 「New query」をクリック

3. **SQLを実行**
   - プロジェクトルートの`supabase-setup-tests.sql`の内容をコピー
   - SQL Editorにペースト
   - 「Run」ボタンをクリック

4. **テーブルを確認**
   - 左側のメニューから「Table Editor」をクリック
   - 以下のテーブルが表示されることを確認：
     - `tests`
     - `test_questions`
     - `test_choices`
     - `test_attempts`
     - `test_answers`

### 手順2: 開発サーバーを再起動

ターミナルで：
```bash
# Ctrl+C でサーバーを停止してから
npm run dev
```

### 手順3: 動作確認

1. **組織管理者アカウントでログイン**
   - 組織管理者権限のあるアカウントでログイン

2. **テスト一覧ページにアクセス**
   - サイドバーから「テスト」をクリック
   - または直接 `http://localhost:3000/tests` にアクセス

3. **テストを作成**
   - 「テストを作成」ボタンをクリック
   - テストタイトルを入力
   - 動画を選択
   - 問いを追加
   - 選択肢を入力
   - 正解を選択
   - 「テストを保存」をクリック

4. **作成したテストを確認**
   - テスト一覧ページに戻る
   - 作成したテストが表示されることを確認

## 🔒 セキュリティポリシー（RLS）

### 権限設定

#### 組織管理者（org_admin, organization_admin）
- ✅ テストの作成
- ✅ テストの編集
- ✅ テストの削除
- ✅ 組織内の全ユーザーの受験履歴を閲覧

#### 一般ユーザー
- ✅ テストの閲覧
- ✅ テストの受験
- ✅ 自分の受験履歴を閲覧

## 📂 ファイル構成

```
pages/
  tests/
    index.vue        # テスト一覧ページ
    create.vue       # テスト作成ページ
    [id].vue         # テスト結果ページ（既存）

server/
  api/
    tests/
      index.get.ts   # テスト一覧取得API
      index.post.ts  # テスト作成API
      [id].get.ts    # テスト詳細取得API
      [id].delete.ts # テスト削除API

supabase-setup-tests.sql  # テーブル作成SQL
```

## 🎨 UI/UX の特徴

### カラーテーマ
- 💜 メインカラー: 紫色（#9333ea）
- 🔵 アクセント: 青色（選択肢ラベル）
- 🟢 正解: 緑色
- 🔴 削除: 赤色

### インタラクティブな要素
- ホバー効果
- スムーズなトランジション
- カードの浮き上がり効果

### 使いやすい問い作成UI
- 問い番号が目立つデザイン
- A, B, C, D のラベル付き選択肢
- 2択/3択/4択の簡単切り替え
- 分かりやすい正解チェックボックス

## ⚠️ トラブルシューティング

### エラー: "テストの作成は組織管理者のみ可能です"
- ログインしているアカウントが組織管理者権限を持っているか確認
- Supabaseの`auth.users`テーブルで`raw_user_meta_data`の`role`が`org_admin`または`organization_admin`であることを確認

### エラー: "テーブルが見つかりません"
- `supabase-setup-tests.sql`を正しく実行したか確認
- Supabaseの「Table Editor」で5つのテーブルが存在することを確認

### テストが保存されない
1. ブラウザの開発者ツールでコンソールエラーを確認
2. ネットワークタブでAPIリクエストのステータスを確認
3. Supabaseの「Table Editor」で`tests`テーブルにデータが追加されているか確認

### テスト一覧が表示されない
1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
2. 開発サーバーを再起動
3. ログインし直す

## 📝 次のステップ

1. **テスト編集機能の実装**
   - `pages/tests/edit/[id].vue`を作成
   - `server/api/tests/[id].put.ts`を作成

2. **テスト受験機能の実装**
   - `pages/tests/take/[id].vue`を作成
   - `server/api/tests/[id]/submit.post.ts`を作成

3. **テスト結果の集計・表示**
   - `pages/tests/[id].vue`を拡張
   - 受験履歴の統計情報を表示

4. **通知機能の追加**
   - 新しいテストが作成されたときに通知
   - テスト結果が出たときに通知

## 💡 ヒント

- テストは動画と紐付けられているため、動画ページからテストにアクセスできるようにすると便利です
- テスト結果ページ（`pages/tests/[id].vue`）は既に存在するので、動画視聴完了者の一覧と統合できます
- テスト受験機能を実装する際は、制限時間や再受験の可否などの設定も追加すると良いでしょう












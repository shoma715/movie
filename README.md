# マナベル - 動画編集アプリ

Nuxt.jsとSupabaseを使用した動画編集アプリケーションです。

## 機能

- 動画のアップロードとトリミング
- メディアライブラリから過去の動画を選択
- テキストの挿入（複数追加可能、AI文字起こし対応予定）
- 画像の挿入（位置指定、複数追加可能）
- 左サイドバーからパネルを開閉

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseの設定

1. Supabaseプロジェクトを作成
2. ストレージバケット「videos」を作成
   - Supabaseダッシュボード → Storage → New bucket
   - バケット名: `videos`
   - Public bucket: 有効化（動画を公開する場合）

3. 環境変数の設定

**ローカル開発環境（`.env`ファイルを作成）**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

**Netlifyでの環境変数設定**

1. Netlifyダッシュボードにログイン
2. プロジェクトを選択
3. **Site settings** → **Environment variables** に移動
4. 以下の環境変数を追加：
   - `SUPABASE_URL`: SupabaseプロジェクトのURL
   - `SUPABASE_ANON_KEY`: Supabaseの匿名キー（公開キー）
   - `SUPABASE_SERVICE_KEY`: Supabaseのサービスロールキー（秘密キー）

   **重要**: `SUPABASE_SERVICE_KEY`は機密情報のため、**Build settings**で「Sensitive variable」としてマークしてください。

5. 環境変数を追加した後、**Deploy settings** → **Trigger deploy** → **Clear cache and deploy site** を実行して再デプロイしてください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 使用方法

1. **動画のアップロード**: 中央の「+ 動画をアップロード」エリアをクリックして動画を選択
2. **メディアライブラリから選択**: 「メディアから選択」ボタンをクリックして過去の動画を選択
3. **トリミング**: 開始時間と終了時間を入力して「トリミングを適用」をクリック
4. **テキスト挿入**: 左サイドバーのテキストアイコンをクリックしてパネルを開く
5. **画像挿入**: 左サイドバーの画像アイコンをクリックしてパネルを開く

## 技術スタック

- Nuxt.js 4
- Vue 3
- Supabase
- FFmpeg.wasm（動画トリミング用）

## 注意事項

- 動画のトリミングはブラウザ上で実行されるため、大きなファイルの処理には時間がかかる場合があります
- AI文字起こし機能は今後実装予定です
- Supabaseのストレージバケットが存在しない場合、メディアライブラリ機能は動作しませんが、ローカルでの動画編集は可能です

## 本番環境へのデプロイ

### Netlifyへのデプロイ

1. **環境変数の設定**（上記の「Netlifyでの環境変数設定」を参照）
2. GitリポジトリをNetlifyに接続
3. ビルド設定：
   - **Build command**: `npm run build`
   - **Publish directory**: `.output/public`
4. デプロイを実行

### ローカルでのビルド確認

```bash
npm run build
npm run preview
```

デプロイの詳細については、[Nuxtのデプロイメントドキュメント](https://nuxt.com/docs/getting-started/deployment)を参照してください。

### トラブルシューティング

**NetlifyでSupabaseのデータが表示されない場合**

1. Netlifyダッシュボードで環境変数が正しく設定されているか確認
2. 環境変数名が正確か確認（`SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_KEY`）
3. 環境変数を追加・変更した後は、必ず再デプロイを実行
4. Netlifyのビルドログで環境変数が読み込まれているか確認（機密情報は表示されませんが、変数名は確認できます）
-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 動画テーブル
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: すべてのユーザーがカテゴリを閲覧可能
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- RLSポリシー: 認証済みユーザーがカテゴリを作成可能
CREATE POLICY "Users can create categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLSポリシー: すべてのユーザーが動画を閲覧可能
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

-- RLSポリシー: 認証済みユーザーが動画を作成可能
CREATE POLICY "Users can create videos"
  ON videos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLSポリシー: 認証済みユーザーが自分の動画を更新可能
CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

-- RLSポリシー: 認証済みユーザーが自分の動画を削除可能
CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- タグテーブル
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 動画とタグの関連テーブル
CREATE TABLE IF NOT EXISTS video_tags (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, tag_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_video_tags_video_id ON video_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag_id ON video_tags(tag_id);

-- RLSを有効化
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: すべてのユーザーがタグを閲覧可能
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- RLSポリシー: 認証済みユーザーがタグを作成可能
CREATE POLICY "Users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLSポリシー: すべてのユーザーが動画タグの関連を閲覧可能
CREATE POLICY "Video tags are viewable by everyone"
  ON video_tags FOR SELECT
  USING (true);

-- RLSポリシー: 認証済みユーザーが動画タグの関連を作成可能
CREATE POLICY "Users can create video tags"
  ON video_tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLSポリシー: 認証済みユーザーが動画タグの関連を削除可能
CREATE POLICY "Users can delete video tags"
  ON video_tags FOR DELETE
  USING (auth.role() = 'authenticated');

-- ストレージ動画ファイル名テーブル（メディアライブラリ用）
CREATE TABLE IF NOT EXISTS storage_video_files (
  id BIGSERIAL PRIMARY KEY,
  storage_name TEXT NOT NULL UNIQUE, -- Supabase Storage上のファイル名（例: {userId}-{timestamp}-{random}.mp4）
  original_name TEXT NOT NULL,       -- アップロード時の元のファイル名（例: ラジオ.mp4）
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_storage_video_files_user_id ON storage_video_files(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_video_files_storage_name ON storage_video_files(storage_name);

-- RLSを有効化
ALTER TABLE storage_video_files ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: すべてのユーザーが動画ファイル名を閲覧可能（表示名共有のため）
CREATE POLICY "Storage video files are viewable by everyone"
  ON storage_video_files FOR SELECT
  USING (true);

-- RLSポリシー: 認証済みユーザーが動画ファイル名を登録可能
CREATE POLICY "Users can insert storage video files"
  ON storage_video_files FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');



-- 下書き機能のためのカラムを追加
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS draft_data JSONB;

-- インデックスを作成（下書きの検索を高速化）
CREATE INDEX IF NOT EXISTS idx_videos_is_draft ON videos(is_draft);
CREATE INDEX IF NOT EXISTS idx_videos_user_draft ON videos(user_id, is_draft) WHERE is_draft = TRUE;


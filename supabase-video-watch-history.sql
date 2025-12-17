-- 動画視聴履歴テーブル
CREATE TABLE IF NOT EXISTS video_watch_history (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_video_watch_history_video_id ON video_watch_history(video_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_user_id ON video_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_completed ON video_watch_history(is_completed);

-- RLSを有効化
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 認証済みユーザーが自分の視聴履歴を閲覧可能
CREATE POLICY "Users can view their own watch history"
  ON video_watch_history FOR SELECT
  USING (auth.uid() = user_id);

-- RLSポリシー: 認証済みユーザーが自分の視聴履歴を作成・更新可能
CREATE POLICY "Users can create and update their own watch history"
  ON video_watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
  ON video_watch_history FOR UPDATE
  USING (auth.uid() = user_id);

-- 組織管理者は自分の組織のユーザーの視聴履歴を閲覧可能
-- 注意: このポリシーはSupabaseのRLSでは実装が難しいため、
-- APIレベルで実装する必要があります





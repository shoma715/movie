-- video_watch_historyテーブルを作成
CREATE TABLE IF NOT EXISTS public.video_watch_history (
  id BIGSERIAL PRIMARY KEY,
  video_id BIGINT NOT NULL,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_video_watch_history_video_id ON public.video_watch_history(video_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_user_id ON public.video_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_is_completed ON public.video_watch_history(is_completed);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成（ユーザーは自分の視聴履歴のみ読み書き可能）
CREATE POLICY "Users can view their own watch history"
  ON public.video_watch_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history"
  ON public.video_watch_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
  ON public.video_watch_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 組織管理者は組織内の全ユーザーの視聴履歴を閲覧可能
CREATE POLICY "Org admins can view organization watch history"
  ON public.video_watch_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'org_admin'
        OR auth.users.raw_user_meta_data->>'role' = 'organization_admin'
      )
    )
  );

-- コメント追加
COMMENT ON TABLE public.video_watch_history IS '動画視聴履歴テーブル';
COMMENT ON COLUMN public.video_watch_history.video_id IS '動画ID';
COMMENT ON COLUMN public.video_watch_history.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.video_watch_history.started_at IS '視聴開始日時';
COMMENT ON COLUMN public.video_watch_history.completed_at IS '視聴完了日時';
COMMENT ON COLUMN public.video_watch_history.is_completed IS '視聴完了フラグ';











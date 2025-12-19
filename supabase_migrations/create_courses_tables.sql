-- コース管理機能用のテーブル作成

-- coursesテーブル: コースの基本情報
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- course_contentsテーブル: コースと動画の紐付け
CREATE TABLE IF NOT EXISTS course_contents (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, video_id)
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_courses_organization ON courses(organization_id);
CREATE INDEX IF NOT EXISTS idx_course_contents_course_id ON course_contents(course_id);
CREATE INDEX IF NOT EXISTS idx_course_contents_video_id ON course_contents(video_id);
CREATE INDEX IF NOT EXISTS idx_course_contents_order ON course_contents(course_id, order_index);

-- RLS（Row Level Security）ポリシーの設定
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_contents ENABLE ROW LEVEL SECURITY;

-- coursesテーブルのRLSポリシー
-- 認証済みユーザーはすべてのコースを閲覧可能（組織フィルタリングはアプリケーション層で実施）
CREATE POLICY "Authenticated users can view courses"
  ON courses FOR SELECT
  USING (auth.role() = 'authenticated');

-- 認証済みユーザーはコースを作成可能（組織チェックはアプリケーション層で実施）
CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 認証済みユーザーはコースを更新可能（組織・権限チェックはアプリケーション層で実施）
CREATE POLICY "Authenticated users can update courses"
  ON courses FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 認証済みユーザーはコースを削除可能（組織・権限チェックはアプリケーション層で実施）
CREATE POLICY "Authenticated users can delete courses"
  ON courses FOR DELETE
  USING (auth.role() = 'authenticated');

-- course_contentsテーブルのRLSポリシー
-- 認証済みユーザーはすべてのコースコンテンツを閲覧可能（組織フィルタリングはアプリケーション層で実施）
CREATE POLICY "Authenticated users can view course contents"
  ON course_contents FOR SELECT
  USING (auth.role() = 'authenticated');

-- 認証済みユーザーはコースコンテンツを管理可能（組織・権限チェックはアプリケーション層で実施）
CREATE POLICY "Authenticated users can manage course contents"
  ON course_contents FOR ALL
  USING (auth.role() = 'authenticated');

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- coursesテーブルのupdated_at自動更新トリガー
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


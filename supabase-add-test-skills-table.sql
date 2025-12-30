-- テストとスキルの紐づけテーブルを作成（複数のスキルを紐づけ可能）
CREATE TABLE IF NOT EXISTS public.test_skills (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level_on_pass VARCHAR(20) NOT NULL CHECK (proficiency_level_on_pass IN ('triangle', 'circle', 'double_circle')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, skill_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_test_skills_test_id ON public.test_skills(test_id);
CREATE INDEX IF NOT EXISTS idx_test_skills_skill_id ON public.test_skills(skill_id);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.test_skills ENABLE ROW LEVEL SECURITY;

-- test_skillsテーブルのポリシー
-- 全ユーザーがテストスキルを閲覧可能
CREATE POLICY "Users can view test skills"
  ON public.test_skills
  FOR SELECT
  USING (true);

-- 組織管理者のみがテストスキルを作成・更新・削除可能
CREATE POLICY "Org admins can manage test skills"
  ON public.test_skills
  FOR ALL
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
COMMENT ON TABLE public.test_skills IS 'テストとスキルの紐づけテーブル（複数のスキルを紐づけ可能）';
COMMENT ON COLUMN public.test_skills.test_id IS 'テストID';
COMMENT ON COLUMN public.test_skills.skill_id IS 'スキルID';
COMMENT ON COLUMN public.test_skills.proficiency_level_on_pass IS 'テスト合格時に付与する習熟度レベル（triangle: △, circle: ○, double_circle: ◎）';

-- 既存のtestsテーブルのskill_idとproficiency_level_on_passカラムは残しておく（後方互換性のため）
-- ただし、今後はtest_skillsテーブルを使用する

-- 既存のtest_skillsテーブルのproficiency_level_on_passカラムのサイズを拡張（double_circleが12文字のため）
ALTER TABLE public.test_skills ALTER COLUMN proficiency_level_on_pass TYPE VARCHAR(20);

-- 既存のtestsテーブルのproficiency_level_on_passカラムのサイズを拡張（double_circleが12文字のため）
ALTER TABLE public.tests ALTER COLUMN proficiency_level_on_pass TYPE VARCHAR(20);


-- スキルテーブルを作成
CREATE TABLE IF NOT EXISTS public.skills (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, organization)
);

-- スキル習熟度テーブルを作成
CREATE TABLE IF NOT EXISTS public.skill_proficiencies (
  id BIGSERIAL PRIMARY KEY,
  skill_id BIGINT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (proficiency_level IN ('none', 'triangle', 'circle', 'double_circle')),
  -- none = ×, triangle = △, circle = ○, double_circle = ◎
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(skill_id, user_id)
);

-- testsテーブルにスキル関連のカラムを追加
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS skill_id BIGINT REFERENCES public.skills(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS proficiency_level_on_pass VARCHAR(20) CHECK (proficiency_level_on_pass IN ('triangle', 'circle', 'double_circle'));

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_skills_organization ON public.skills(organization);
CREATE INDEX IF NOT EXISTS idx_skill_proficiencies_skill_id ON public.skill_proficiencies(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiencies_user_id ON public.skill_proficiencies(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_skill_id ON public.tests(skill_id);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_proficiencies ENABLE ROW LEVEL SECURITY;

-- skillsテーブルのポリシー
-- 全ユーザーがスキルを閲覧可能（同じ組織内）
CREATE POLICY "Users can view skills in their organization"
  ON public.skills
  FOR SELECT
  USING (
    organization = (
      SELECT raw_user_meta_data->>'organization' 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- 組織管理者のみがスキルを作成可能
CREATE POLICY "Org admins can create skills"
  ON public.skills
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'org_admin'
        OR auth.users.raw_user_meta_data->>'role' = 'organization_admin'
      )
      AND auth.users.raw_user_meta_data->>'organization' = skills.organization
    )
  );

-- 組織管理者のみがスキルを更新可能
CREATE POLICY "Org admins can update skills"
  ON public.skills
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'org_admin'
        OR auth.users.raw_user_meta_data->>'role' = 'organization_admin'
      )
      AND auth.users.raw_user_meta_data->>'organization' = skills.organization
    )
  );

-- 組織管理者のみがスキルを削除可能
CREATE POLICY "Org admins can delete skills"
  ON public.skills
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'org_admin'
        OR auth.users.raw_user_meta_data->>'role' = 'organization_admin'
      )
      AND auth.users.raw_user_meta_data->>'organization' = skills.organization
    )
  );

-- skill_proficienciesテーブルのポリシー
-- ユーザーは自分の習熟度を閲覧可能
CREATE POLICY "Users can view their own proficiencies"
  ON public.skill_proficiencies
  FOR SELECT
  USING (auth.uid() = user_id);

-- 組織管理者は組織内の全ユーザーの習熟度を閲覧可能
CREATE POLICY "Org admins can view organization proficiencies"
  ON public.skill_proficiencies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u1
      JOIN public.skills s ON s.id = skill_proficiencies.skill_id
      JOIN auth.users u2 ON u2.id = skill_proficiencies.user_id
      WHERE u1.id = auth.uid()
      AND (
        u1.raw_user_meta_data->>'role' = 'org_admin'
        OR u1.raw_user_meta_data->>'role' = 'organization_admin'
      )
      AND u1.raw_user_meta_data->>'organization' = s.organization
      AND u1.raw_user_meta_data->>'organization' = u2.raw_user_meta_data->>'organization'
    )
  );

-- システムが習熟度を更新可能（テスト合格時など）
-- 注意: RLSポリシーは認証済みユーザーに対してのみ適用されるため、
-- サービスロールキーを使用する場合はRLSをバイパスします
CREATE POLICY "System can update proficiencies"
  ON public.skill_proficiencies
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- システムが習熟度を作成可能
CREATE POLICY "System can create proficiencies"
  ON public.skill_proficiencies
  FOR INSERT
  WITH CHECK (true);

-- ユーザーは自分の習熟度を更新可能（テスト合格時など）
CREATE POLICY "Users can update their own proficiencies"
  ON public.skill_proficiencies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- コメント追加
COMMENT ON TABLE public.skills IS 'スキルマスターテーブル';
COMMENT ON TABLE public.skill_proficiencies IS 'スキル習熟度テーブル';

COMMENT ON COLUMN public.skills.name IS 'スキル名';
COMMENT ON COLUMN public.skills.organization IS '組織名';

COMMENT ON COLUMN public.skill_proficiencies.skill_id IS 'スキルID';
COMMENT ON COLUMN public.skill_proficiencies.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.skill_proficiencies.proficiency_level IS '習熟度レベル（none: ×, triangle: △, circle: ○, double_circle: ◎）';

COMMENT ON COLUMN public.tests.skill_id IS '紐付けるスキルID';
COMMENT ON COLUMN public.tests.proficiency_level_on_pass IS 'テスト合格時に付与する習熟度レベル（triangle: △, circle: ○, double_circle: ◎）';


-- テストテーブルを作成
CREATE TABLE IF NOT EXISTS public.tests (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_id BIGINT NOT NULL,
  organization VARCHAR(100),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 問題テーブルを作成
CREATE TABLE IF NOT EXISTS public.test_questions (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single', 'multiple')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, question_order)
);

-- 選択肢テーブルを作成
CREATE TABLE IF NOT EXISTS public.test_choices (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  choice_order INTEGER NOT NULL,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, choice_order)
);

-- テスト受験履歴テーブルを作成
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score DECIMAL(5, 2),
  max_score DECIMAL(5, 2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- テスト回答テーブルを作成
CREATE TABLE IF NOT EXISTS public.test_answers (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  choice_id BIGINT NOT NULL REFERENCES public.test_choices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, question_id, choice_id)
);

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_tests_video_id ON public.tests(video_id);
CREATE INDEX IF NOT EXISTS idx_tests_organization ON public.tests(organization);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON public.tests(created_by);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_choices_question_id ON public.test_choices(question_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_attempt_id ON public.test_answers(attempt_id);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;

-- testsテーブルのポリシー
-- 全ユーザーがテストを閲覧可能
CREATE POLICY "Users can view tests"
  ON public.tests
  FOR SELECT
  USING (true);

-- 組織管理者のみがテストを作成可能
CREATE POLICY "Org admins can create tests"
  ON public.tests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'org_admin'
        OR auth.users.raw_user_meta_data->>'role' = 'organization_admin'
      )
    )
  );

-- 組織管理者のみがテストを更新可能
CREATE POLICY "Org admins can update tests"
  ON public.tests
  FOR UPDATE
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

-- 組織管理者のみがテストを削除可能
CREATE POLICY "Org admins can delete tests"
  ON public.tests
  FOR DELETE
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

-- test_questionsテーブルのポリシー
-- 全ユーザーが問題を閲覧可能
CREATE POLICY "Users can view questions"
  ON public.test_questions
  FOR SELECT
  USING (true);

-- 組織管理者のみが問題を作成・更新・削除可能
CREATE POLICY "Org admins can manage questions"
  ON public.test_questions
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

-- test_choicesテーブルのポリシー
-- 全ユーザーが選択肢を閲覧可能
CREATE POLICY "Users can view choices"
  ON public.test_choices
  FOR SELECT
  USING (true);

-- 組織管理者のみが選択肢を作成・更新・削除可能
CREATE POLICY "Org admins can manage choices"
  ON public.test_choices
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

-- test_attemptsテーブルのポリシー
-- ユーザーは自分の受験履歴を閲覧可能
CREATE POLICY "Users can view their own attempts"
  ON public.test_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分の受験履歴を作成可能
CREATE POLICY "Users can create their own attempts"
  ON public.test_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の受験履歴を更新可能
CREATE POLICY "Users can update their own attempts"
  ON public.test_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 組織管理者は組織内の全ユーザーの受験履歴を閲覧可能
CREATE POLICY "Org admins can view organization attempts"
  ON public.test_attempts
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

-- test_answersテーブルのポリシー
-- ユーザーは自分の回答を閲覧可能
CREATE POLICY "Users can view their own answers"
  ON public.test_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts
      WHERE public.test_attempts.id = test_answers.attempt_id
      AND public.test_attempts.user_id = auth.uid()
    )
  );

-- ユーザーは自分の回答を作成可能
CREATE POLICY "Users can create their own answers"
  ON public.test_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts
      WHERE public.test_attempts.id = test_answers.attempt_id
      AND public.test_attempts.user_id = auth.uid()
    )
  );

-- 組織管理者は組織内の全ユーザーの回答を閲覧可能
CREATE POLICY "Org admins can view organization answers"
  ON public.test_answers
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
COMMENT ON TABLE public.tests IS 'テストマスターテーブル';
COMMENT ON TABLE public.test_questions IS 'テスト問題テーブル';
COMMENT ON TABLE public.test_choices IS 'テスト選択肢テーブル';
COMMENT ON TABLE public.test_attempts IS 'テスト受験履歴テーブル';
COMMENT ON TABLE public.test_answers IS 'テスト回答テーブル';

COMMENT ON COLUMN public.tests.title IS 'テストタイトル';
COMMENT ON COLUMN public.tests.video_id IS '紐付ける動画ID';
COMMENT ON COLUMN public.tests.organization IS '組織名';
COMMENT ON COLUMN public.tests.created_by IS '作成者ユーザーID';

COMMENT ON COLUMN public.test_questions.test_id IS 'テストID';
COMMENT ON COLUMN public.test_questions.question_order IS '問題の順序';
COMMENT ON COLUMN public.test_questions.question_text IS '問題文';
COMMENT ON COLUMN public.test_questions.question_type IS '問題タイプ（single: 単一選択, multiple: 複数選択）';

COMMENT ON COLUMN public.test_choices.question_id IS '問題ID';
COMMENT ON COLUMN public.test_choices.choice_order IS '選択肢の順序';
COMMENT ON COLUMN public.test_choices.choice_text IS '選択肢テキスト';
COMMENT ON COLUMN public.test_choices.is_correct IS '正解フラグ';

COMMENT ON COLUMN public.test_attempts.test_id IS 'テストID';
COMMENT ON COLUMN public.test_attempts.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.test_attempts.score IS '得点';
COMMENT ON COLUMN public.test_attempts.max_score IS '最大得点';
COMMENT ON COLUMN public.test_attempts.started_at IS '開始日時';
COMMENT ON COLUMN public.test_attempts.completed_at IS '完了日時';
COMMENT ON COLUMN public.test_attempts.is_completed IS '完了フラグ';

COMMENT ON COLUMN public.test_answers.attempt_id IS '受験履歴ID';
COMMENT ON COLUMN public.test_answers.question_id IS '問題ID';
COMMENT ON COLUMN public.test_answers.choice_id IS '選択肢ID';



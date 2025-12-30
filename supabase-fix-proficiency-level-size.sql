-- proficiency_level_on_passカラムとproficiency_levelカラムのサイズを拡張（double_circleが12文字のため）
-- このスクリプトは既存のテーブルを修正するために使用します

-- test_skillsテーブルのproficiency_level_on_passカラムのサイズを拡張
ALTER TABLE IF EXISTS public.test_skills 
  ALTER COLUMN proficiency_level_on_pass TYPE VARCHAR(20);

-- testsテーブルのproficiency_level_on_passカラムのサイズを拡張
ALTER TABLE IF EXISTS public.tests 
  ALTER COLUMN proficiency_level_on_pass TYPE VARCHAR(20);

-- skill_proficienciesテーブルのproficiency_levelカラムのサイズを拡張
ALTER TABLE IF EXISTS public.skill_proficiencies 
  ALTER COLUMN proficiency_level TYPE VARCHAR(20);

-- 確認用クエリ（オプション）
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('test_skills', 'tests')
--   AND column_name = 'proficiency_level_on_pass';


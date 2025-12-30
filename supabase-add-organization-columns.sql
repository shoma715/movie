-- カテゴリテーブルにorganizationカラムを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS organization VARCHAR(255);

-- タグテーブルにorganizationカラムを追加
ALTER TABLE tags 
ADD COLUMN IF NOT EXISTS organization VARCHAR(255);

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_categories_organization ON categories(organization);
CREATE INDEX IF NOT EXISTS idx_tags_organization ON tags(organization);

-- 既存のデータがある場合、デフォルト値を設定（必要に応じて）
-- UPDATE categories SET organization = '自組織 (ID: 2)' WHERE organization IS NULL;
-- UPDATE tags SET organization = '自組織 (ID: 2)' WHERE organization IS NULL;
















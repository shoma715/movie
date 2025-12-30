-- 既存のstorage_video_filesテーブルのstorage_nameを修正するSQL
-- 注意: このSQLを実行する前に、Supabase Storage上の実際のファイル名を確認してください

-- 1. 現在のデータを確認
SELECT 
  id,
  storage_name,
  original_name,
  user_id,
  created_at
FROM storage_video_files
ORDER BY created_at DESC;

-- 2. 実際のStorage上のファイル名を確認するには、Supabase Storageの管理画面で確認するか、
--    以下のクエリでファイル一覧を取得してください（Storage APIを使用）

-- 3. storage_nameがUUIDのみの場合、実際のファイル名に更新する
--    例: storage_nameが '3cd63770-251f-4b55-970d-a9ebc755541d' の場合、
--    実際のファイル名は '3cd63770-251f-4b55-970d-a9ebc755541d-1767098399701-3uof6.mp4' のような形式

-- 手動で更新する場合の例（実際のファイル名に置き換えてください）:
-- UPDATE storage_video_files 
-- SET storage_name = '3cd63770-251f-4b55-970d-a9ebc755541d-1767098399701-3uof6.mp4'
-- WHERE storage_name = '3cd63770-251f-4b55-970d-a9ebc755541d' 
--   AND original_name = 'ラジオ 2.mp4';

-- UPDATE storage_video_files 
-- SET storage_name = '3cd63770-251f-4b55-970d-a9ebc755541d-1767094225915-p7cjuc.mp4'
-- WHERE storage_name = '3cd63770-251f-4b55-970d-a9ebc755541d' 
--   AND original_name = 'ラジオ.mp4';

-- 4. または、storage_nameがUUIDのみのレコードを削除して、新しい動画をアップロードし直す
--    （新しい動画は正しいstorage_nameで保存されます）

-- 注意: このSQLを実行する前に、バックアップを取ることをお勧めします




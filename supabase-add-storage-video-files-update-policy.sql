-- storage_video_filesテーブルにUPDATEポリシーを追加
-- upsert操作（INSERT/UPDATE）をサポートするため

-- RLSポリシー: 認証済みユーザーが動画ファイル名を更新可能
CREATE POLICY "Users can update storage video files"
  ON storage_video_files FOR UPDATE
  USING (auth.role() = 'authenticated');



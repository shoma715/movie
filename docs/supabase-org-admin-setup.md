# 組織管理者アカウントのメタデータ設定方法

Supabaseダッシュボードでは直接メタデータを編集できない場合があるため、SQL Editorを使用して設定します。

## 手順

### 1. Supabaseダッシュボードにログイン
- https://supabase.com/dashboard にアクセス
- プロジェクトを選択

### 2. SQL Editorを開く
- 左サイドバーの「SQL Editor」をクリック
- 「New query」をクリック

### 3. ユーザーメタデータを更新するSQLを実行

以下のSQLを実行して、組織管理者のメタデータを設定します：

```sql
-- ユーザーのメタデータを更新
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'username', '組織管理者の名前',
    'display_name', '組織管理者の表示名',
    'role', 'org_admin',
    'organization', '会社A'
  ),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'org_admin'
  )
WHERE email = 'jagariko0302@gmail.com';  -- 組織管理者のメールアドレスに変更
```

### 4. 複数の組織管理者を設定する場合

各企業ごとに異なる組織管理者を設定する場合：

```sql
-- 会社Aの組織管理者
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'username', '組織管理者A',
    'display_name', '組織管理者A',
    'role', 'org_admin',
    'organization', '会社A'
  ),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'org_admin'
  )
WHERE email = 'org_admin_a@example.com';

-- 会社Bの組織管理者
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'username', '組織管理者B',
    'display_name', '組織管理者B',
    'role', 'org_admin',
    'organization', '会社B'
  ),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'org_admin'
  )
WHERE email = 'org_admin_b@example.com';
```

### 5. 設定を確認

以下のSQLで設定を確認できます：

```sql
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users
WHERE email = 'jagariko0302@gmail.com';  -- 組織管理者のメールアドレスに変更
```

## メタデータの構造

- **`role`**: `"org_admin"`（必須）- 組織管理者として識別されます
- **`organization`**: 組織名（例: `"会社A"`, `"会社B"`）- どの企業の組織管理者かを示します
- **`username`**: ユーザー名（任意）
- **`display_name`**: 表示名（任意）

## 注意事項

- SQLを実行する前に、メールアドレスを正しいものに変更してください
- `raw_user_meta_data`と`raw_app_meta_data`の両方に`role`を設定することを推奨します
- 既存のメタデータを保持する場合は、`COALESCE`と`||`演算子を使用してマージします


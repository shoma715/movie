<template>
  <div class="login-page">
    <!-- サイドバー -->
    <aside class="sidebar">
      <div class="logo-section">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>VIVNAI</span>
        </div>
      </div>
      <button class="create-btn">
        <span>+ 作成</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </button>
      <nav class="nav-menu">
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>ホーム</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>ブックマーク</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <span>コース</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>マニュアル</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span>テスト</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span>タグ</span>
        </a>
        <div class="nav-divider"></div>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <span>組織設定</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>組織レポート</span>
        </a>
        <a href="#" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          <span>サポート</span>
        </a>
      </nav>
    </aside>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <!-- ヘッダー -->
      <header class="header">
        <div class="header-left">
          <a href="#" class="header-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            ホーム
          </a>
        </div>
        <div class="header-center">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="キーワードで検索" class="search-input" />
          </div>
        </div>
        <div class="header-right">
          <!-- 時計/履歴アイコン -->
          <button class="icon-btn" title="履歴">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          <!-- モニターアイコン -->
          <button class="icon-btn" title="モニター">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <!-- ベルアイコン -->
          <button class="icon-btn" title="通知">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <!-- 家アイコン -->
          <button class="icon-btn" title="ホーム">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
          <!-- ユーザープロフィール -->
          <div v-if="currentUser" class="user-profile">
            <div class="avatar">{{ getAvatarInitial(currentUser.displayName || currentUser.email) }}</div>
            <span class="username">{{ currentUser.displayName || currentUser.email?.split('@')[0] || 'ユーザー' }}</span>
          </div>
          <div v-else class="user-profile">
            <div class="avatar">?</div>
            <span class="username">未ログイン</span>
          </div>
        </div>
      </header>

      <!-- ログインフォーム -->
      <div class="login-container">
        <div class="login-form-wrapper">
          <h1 class="login-title">ログイン</h1>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">メールアドレス</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="メールアドレスを入力"
                class="form-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">パスワード</label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="パスワードを入力"
                class="form-input"
                required
              />
            </div>
            
            <button type="submit" class="login-btn" :disabled="isLoading">
              {{ isLoading ? 'ログイン中...' : 'ログイン' }}
            </button>
          </form>

          <!-- エラーメッセージ -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <!-- 情報セキュリティに関する注意事項 -->
        <div class="security-warning">
          <h2 class="warning-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            重要: 情報セキュリティに関する注意事項
          </h2>
          <p class="warning-subtitle">本システムで取得した情報の取り扱いについて:</p>
          <ul class="warning-list">
            <li>スクリーンショットや画面録画による情報の取得・保存は厳禁です。</li>
            <li>本システムの情報を外部に漏洩した場合、重大な規則違反となり、法的処置を取る場合があります。</li>
            <li>すべてのアクセスはアカウントで管理されており、誰が情報を漏洩したか特定可能です。</li>
            <li>第三者(他者)にログイン情報を提供することは絶対に禁止です。</li>
            <li>会社外からのログインが検知された場合、位置情報により自動検知され、管理者に即座に通報されます。</li>
          </ul>
          <div class="warning-agreement">
            ログインすることで、上記の注意事項に同意したものとみなします。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'vue-router'

const router = useRouter()

// Supabaseクライアント
const config = useRuntimeConfig()
const supabaseUrl = config.public?.supabase?.url || ''
const supabaseKey = config.public?.supabase?.key || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// フォームデータ
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// 現在のユーザー情報
const currentUser = ref<{
  email?: string
  displayName?: string
  user_metadata?: any
} | null>(null)

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
}

// ログイン処理
const handleLogin = async () => {
  if (!supabase) {
    errorMessage.value = 'Supabase接続が利用できません。環境変数を確認してください。'
    console.error('Supabase client is not initialized. URL:', supabaseUrl, 'Key:', supabaseKey ? 'Set' : 'Not set')
    return
  }

  if (!email.value || !password.value) {
    errorMessage.value = 'メールアドレスとパスワードを入力してください。'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = null

    console.log('Attempting login with email:', email.value)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (error) {
      console.error('Login error:', error)
      // エラーメッセージを日本語化
      let errorMsg = 'ログインに失敗しました。'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMsg = 'メールアドレスまたはパスワードが正しくありません。'
      } else if (error.message.includes('Email not confirmed')) {
        errorMsg = 'メールアドレスが確認されていません。メールを確認してください。'
      } else if (error.message.includes('Too many requests')) {
        errorMsg = 'リクエストが多すぎます。しばらく待ってから再度お試しください。'
      } else {
        errorMsg = error.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      }
      
      errorMessage.value = errorMsg
      return
    }

    if (data.user) {
      console.log('Login successful. User:', data.user.email)
      // ユーザー情報を更新
      currentUser.value = {
        email: data.user.email || '',
        displayName: data.user.user_metadata?.display_name || data.user.user_metadata?.username || data.user.email?.split('@')[0] || '',
        user_metadata: data.user.user_metadata
      }
      // ログイン成功 - ホーム画面にリダイレクト
      router.push('/home')
    } else {
      errorMessage.value = 'ログインに失敗しました。ユーザー情報を取得できませんでした。'
    }
  } catch (error: any) {
    console.error('Login error (catch):', error)
    errorMessage.value = `ログイン中にエラーが発生しました: ${error.message || error.toString()}`
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* サイドバー */
.sidebar {
  width: 240px;
  background: #f9fafb;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.logo-section {
  margin-bottom: 10px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
}

.logo svg {
  color: #3b82f6;
}

.create-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.create-btn:hover {
  background: #2563eb;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-item:hover {
  background: #f0f0f0;
  color: #3b82f6;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ヘッダー */
.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.header-link:hover {
  color: #3b82f6;
}

.header-center {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9fafb;
}

.search-bar svg {
  color: #999;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  position: relative;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f5f5f5;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #f5f5f5;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #9333ea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* ログインコンテナ */
.login-container {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.login-form-wrapper {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 30px 0;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.login-btn {
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: #2563eb;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
}

/* 情報セキュリティ警告 */
.security-warning {
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 24px;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 12px 0;
}

.warning-title svg {
  color: #dc2626;
  flex-shrink: 0;
}

.warning-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 16px 0;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.warning-list li {
  font-size: 14px;
  color: #92400e;
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
  line-height: 1.6;
}

.warning-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  font-weight: 700;
  font-size: 18px;
}

.warning-agreement {
  background: white;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  text-align: center;
  margin-top: 16px;
}
</style>


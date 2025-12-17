<template>
  <div class="results-page">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <div class="logo">VIVNAI</div>
      </div>
      <div class="header-center">
        <div class="search-bar">
          <input type="text" placeholder="Q キーワードで検索" class="search-input" />
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </button>
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <div class="user-profile-container">
          <div 
            v-if="currentUser" 
            class="user-profile" 
            @click="showUserMenu = !showUserMenu"
          >
            <div class="avatar">{{ getAvatarInitial(currentUser.displayName || currentUser.email) }}</div>
            <span class="username">{{ currentUser.displayName || currentUser.email?.split('@')[0] || 'ユーザー' }}</span>
          </div>
          <div 
            v-else 
            class="user-profile"
            @click="showUserMenu = !showUserMenu"
          >
            <div class="avatar">?</div>
            <span class="username">未ログイン</span>
          </div>
          
          <!-- ユーザーメニュー -->
          <div v-if="showUserMenu" class="user-menu">
            <button class="menu-item" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <!-- サイドバー -->
      <aside class="sidebar">
        <button class="create-btn" @click="navigateToEdit">
          <span>+ 作成</span>
        </button>
        <nav class="nav-menu">
          <NuxtLink to="/home" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>ホーム</span>
          </NuxtLink>
          <NuxtLink to="/" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <span>コース</span>
          </NuxtLink>
          <NuxtLink 
            v-if="currentUser && (currentUser.user_metadata?.role === 'org_admin' || currentUser.user_metadata?.role === 'organization_admin')" 
            to="/organization" 
            class="nav-item"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <span>組織設定</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="content-area">
        <div class="results-content">
          <div class="page-header">
            <h1 class="page-title">受験結果一覧</h1>
            <div class="results-count">{{ results.length }}件</div>
          </div>

          <div v-if="isLoading" class="loading">
            <p>読み込み中...</p>
          </div>

          <div v-else-if="results.length === 0" class="empty-state">
            <p>まだ誰も見ていません</p>
            <p class="empty-description">動画を最後まで視聴したユーザーの結果がここに表示されます</p>
          </div>

          <div v-else class="results-table-container">
            <table class="results-table">
              <thead>
                <tr>
                  <th>ユーザー名</th>
                  <th>メールアドレス</th>
                  <th>開始日時</th>
                  <th>完了日時</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in results" :key="result.userId">
                  <td>
                    <div class="user-cell">
                      <div class="avatar-small">{{ getAvatarInitial(result.userName) }}</div>
                      <span>{{ result.userName }}</span>
                    </div>
                  </td>
                  <td>{{ result.email }}</td>
                  <td>{{ formatDateTime(result.startedAt) }}</td>
                  <td>{{ formatDateTime(result.completedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="back-button-container">
            <button class="btn-secondary" @click="goBack">動画詳細に戻る</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const route = useRoute()
const router = useRouter()

// Supabaseクライアント
const config = useRuntimeConfig()
const supabaseUrl = config.public?.supabase?.url || ''
const supabaseKey = config.public?.supabase?.key || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// 現在のユーザー情報
const currentUser = ref<{
  email?: string
  displayName?: string
  user_metadata?: any
} | null>(null)

// ユーザーメニューの表示状態
const showUserMenu = ref(false)

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
}

// 受験結果
const results = ref<Array<any>>([])

const isLoading = ref(true)

// 受験結果を読み込む
const loadResults = async () => {
  const videoId = route.params.id
  if (!videoId || !supabase) {
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true

    // 認証トークンを取得
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('ログインが必要です')
      router.push('/login')
      return
    }

    const response = await $fetch(`/api/videos/${videoId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    results.value = response || []
  } catch (error: any) {
    console.error('Error loading results:', error)
    if (error.statusCode === 403) {
      alert('組織管理者のみアクセスできます')
      router.push(`/videos/${route.params.id}`)
    } else {
      alert('受験結果の取得に失敗しました')
    }
  } finally {
    isLoading.value = false
  }
}

// 日時をフォーマット
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// ユーザー情報を取得
const loadCurrentUser = async () => {
  if (!supabase) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      currentUser.value = {
        email: user.email || '',
        displayName: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || '',
        user_metadata: user.user_metadata
      }
    }
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const navigateToEdit = () => {
  router.push('/edit')
}

// 動画詳細に戻る
const goBack = () => {
  router.push(`/videos/${route.params.id}`)
}

// ログアウト処理
const handleLogout = async () => {
  if (!supabase) {
    alert('Supabase接続が利用できません')
    return
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('ログアウトに失敗しました: ' + error.message)
      return
    }
    
    currentUser.value = null
    showUserMenu.value = false
    router.push('/login')
  } catch (error: any) {
    console.error('Logout error:', error)
    alert('ログアウト中にエラーが発生しました')
  }
}

// メニュー外をクリックしたら閉じる
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-profile-container')) {
    showUserMenu.value = false
  }
}

onMounted(async () => {
  await loadCurrentUser()
  await loadResults()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ヘッダー */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #333;
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

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
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
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f5f5f5;
}

.user-profile-container {
  position: relative;
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

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.menu-item:hover {
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

.main-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

/* サイドバー */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.create-btn {
  width: 100%;
  padding: 12px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-btn:hover {
  background: #7e22ce;
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
  background: #f5f5f5;
  color: #9333ea;
}

.nav-item svg {
  flex-shrink: 0;
}

/* メインコンテンツ */
.content-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.results-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.results-count {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.empty-description {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.results-table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table thead {
  background: #f9fafb;
}

.results-table th {
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.results-table td {
  padding: 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.results-table tbody tr:hover {
  background: #f9fafb;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #9333ea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.back-button-container {
  margin-top: 30px;
  text-align: center;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>


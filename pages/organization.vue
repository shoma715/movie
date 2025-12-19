<template>
  <div class="organization-page">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <div class="logo">マナベル</div>
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
        <button class="icon-btn notification-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="badge">5</span>
        </button>
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 10v6M2 10l10-8 10 8M2 10v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6"/>
            <path d="M6 14h12"/>
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
            <a href="#" class="menu-item menu-link">
              もっとみる >
            </a>
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
          <a href="#" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span>ブックマーク</span>
          </a>
          <NuxtLink to="/courses" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <span>コース</span>
          </NuxtLink>
          <NuxtLink to="/manuals" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>マニュアル</span>
          </NuxtLink>
          <NuxtLink to="/tests" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>テスト</span>
          </NuxtLink>
          <a href="#" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>タグ</span>
          </a>
          <NuxtLink to="/organization" class="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <span>組織設定</span>
          </NuxtLink>
          <a href="#" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>設定</span>
          </a>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="content-area">
        <div class="user-management">
          <div class="page-header">
            <h1 class="page-title">ユーザ管理</h1>
            <button class="tutorial-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-8 10 8M2 10v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6"/>
                <path d="M6 14h12"/>
              </svg>
              チュートリアル
            </button>
          </div>

          <!-- 新規ユーザ作成セクション -->
          <div class="create-user-section">
            <button class="section-toggle" @click="showCreateForm = !showCreateForm">
              <span>{{ showCreateForm ? '▼' : '▶' }} 新規ユーザ作成</span>
            </button>
            
            <div v-if="showCreateForm" class="create-form">
              <div class="form-row">
                <div class="form-group">
                  <label>メールアドレス</label>
                  <input 
                    v-model="newUser.email" 
                    type="email" 
                    placeholder="メールアドレスを入力"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>表示名</label>
                  <input 
                    v-model="newUser.displayName" 
                    type="text" 
                    placeholder="表示名を入力"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>パスワード</label>
                  <input 
                    v-model="newUser.password" 
                    type="password" 
                    placeholder="パスワードを入力"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>所属組織</label>
                  <input 
                    :value="currentOrganization"
                    type="text" 
                    readonly
                    class="form-input readonly"
                  />
                </div>
                <div class="form-group">
                  <label>ロール</label>
                  <select v-model="newUser.role" class="form-input">
                    <option value="user">一般ユーザー</option>
                    <option value="org_admin">組織管理者</option>
                  </select>
                </div>
              </div>
              <button class="create-btn-form" @click="createUser" :disabled="isCreating">
                {{ isCreating ? '作成中...' : '作成する' }}
              </button>
            </div>
          </div>

          <!-- ユーザ一覧 -->
          <div class="user-list-section">
            <h2 class="section-title">ユーザ一覧</h2>
            <div class="table-container">
              <table class="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>メール</th>
                    <th>表示名</th>
                    <th>組織</th>
                    <th>ロール</th>
                    <th>有効</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoading">
                    <td colspan="7" class="loading-cell">読み込み中...</td>
                  </tr>
                  <tr v-else-if="users.length === 0">
                    <td colspan="7" class="empty-cell">ユーザーが存在しません</td>
                  </tr>
                  <tr v-else v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.displayName }}</td>
                    <td>{{ user.organization }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                      <span :class="['status-badge', user.active ? 'active' : 'inactive']">
                        {{ user.active ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td>
                      <button class="edit-btn" @click="editUser(user)">編集</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

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

// 新規ユーザー作成フォーム
const showCreateForm = ref(true)
const newUser = ref({
  email: '',
  displayName: '',
  password: '',
  organization: '自組織 (ID: 2)',
  role: 'user'
})

// 現在の組織（実際の実装では、ログインユーザーから取得）
const currentOrganization = ref('自組織 (ID: 2)')

// ユーザー一覧
const users = ref<Array<{
  id: number
  email: string
  displayName: string
  organization: string
  role: string
  active: boolean
}>>([])

const isLoading = ref(false)
const isCreating = ref(false)
const errorMessage = ref<string | null>(null)

// 動画編集画面に遷移
const navigateToEdit = () => {
  router.push('/edit')
}

// ユーザー一覧を取得
const loadUsers = async () => {
  if (!supabase) {
    console.warn('Supabase client not available')
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = null

    // 現在の組織を確認
    console.log('[LoadUsers] Current organization:', currentOrganization.value)
    
    // APIエンドポイントからユーザー一覧を取得（現在の組織でフィルタリング）
    const response = await $fetch('/api/users', {
      method: 'GET',
      query: {
        organization: currentOrganization.value
      }
    }).catch((error) => {
      console.error('[LoadUsers] Error fetching users:', error)
      // APIが存在しない場合は、空の配列を返す
      return []
    })

    console.log('[LoadUsers] Fetched users:', response)

    if (response && Array.isArray(response)) {
      // レスポンスをフォーマット（組織情報はAPIから取得したものを使用）
      users.value = response.map((user: any) => ({
        id: user.id || user.uuid,
        email: user.email || '',
        displayName: user.displayName || user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Unknown',
        organization: user.organization || currentOrganization.value,
        role: user.role || user.user_metadata?.role || 'user',
        active: user.active !== undefined ? user.active : (user.email_confirmed_at !== null)
      }))
      
      console.log('[LoadUsers] Formatted users:', users.value)
    } else {
      users.value = []
    }
  } catch (error: any) {
    console.error('Error loading users:', error)
    errorMessage.value = 'ユーザー一覧の取得に失敗しました'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

// ユーザーを作成
const createUser = async () => {
  if (!newUser.value.email || !newUser.value.displayName || !newUser.value.password) {
    alert('メールアドレス、表示名、パスワードは必須です')
    return
  }

  if (!supabase) {
    alert('Supabase接続が利用できません')
    return
  }

  try {
    isCreating.value = true
    errorMessage.value = null

    // 現在の組織を確認
    console.log('[CreateUser] Current organization:', currentOrganization.value)
    
    // APIエンドポイントにユーザー作成リクエストを送信
    const requestBody = {
      email: newUser.value.email,
      username: newUser.value.displayName,
      password: newUser.value.password,
      role: newUser.value.role || 'user',
      organization: currentOrganization.value
    }
    
    console.log('[CreateUser] Request body:', { ...requestBody, password: '***' })
    
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: requestBody
    }).catch((error: any) => {
      console.error('[CreateUser] Error creating user:', error)
      throw new Error(error?.data?.message || error?.message || 'ユーザーの作成に失敗しました')
    })

    console.log('[CreateUser] User created successfully:', response)

    // 成功したらフォームをリセット
    newUser.value = {
      email: '',
      displayName: '',
      password: '',
      organization: currentOrganization.value,
      role: 'user'
    }

    // ユーザー一覧を再読み込み
    await loadUsers()

    alert('ユーザーを作成しました')
  } catch (error: any) {
    console.error('Error creating user:', error)
    alert(error.message || 'ユーザーの作成に失敗しました')
  } finally {
    isCreating.value = false
  }
}

// ユーザーを編集
const editUser = (user: any) => {
  // TODO: 編集機能を実装
  alert(`ユーザー ${user.displayName} の編集機能は今後実装予定です`)
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
    
    // ログアウト成功
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
      // 組織情報も取得
      if (user.user_metadata?.organization) {
        currentOrganization.value = user.user_metadata.organization
      }
      
      // 組織管理者かどうかをチェック
      const userRole = user.user_metadata?.role || user.app_metadata?.role
      if (userRole !== 'org_admin') {
        // 組織管理者でない場合はホームページにリダイレクト
        alert('このページにアクセスする権限がありません。組織管理者のみアクセスできます。')
        router.push('/home')
        return
      }
    } else {
      // 未ログインの場合はログインページにリダイレクト
      router.push('/login')
      return
    }
  } catch (error) {
    console.error('Error loading user:', error)
    router.push('/login')
  }
}

// コンポーネントマウント時にユーザー一覧とユーザー情報を読み込む
onMounted(async () => {
  await loadCurrentUser()
  // 組織管理者の場合のみユーザー一覧を読み込む
  if (currentUser.value) {
    const userRole = currentUser.value.user_metadata?.role
    if (userRole === 'org_admin') {
      loadUsers()
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.organization-page {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  gap: 24px;
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
}

.search-input {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #9333ea;
  background: white;
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

.notification-btn {
  position: relative;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
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

/* ユーザーメニュー */
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

.menu-item svg {
  flex-shrink: 0;
  color: #666;
}

.menu-link {
  text-decoration: none;
  color: #3b82f6;
  border-top: 1px solid #e0e0e0;
}

.menu-link:hover {
  background: #f0f7ff;
  color: #2563eb;
}

/* ユーザーメニュー */
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

.menu-item svg {
  flex-shrink: 0;
  color: #666;
}

.menu-link {
  text-decoration: none;
  color: #3b82f6;
  border-top: 1px solid #e0e0e0;
}

.menu-link:hover {
  background: #f0f7ff;
  color: #2563eb;
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

/* メインレイアウト */
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

.nav-item.active {
  background: #f3e8ff;
  color: #9333ea;
  font-weight: 600;
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

.user-management {
  max-width: 1400px;
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

.tutorial-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.tutorial-btn:hover {
  background: #2563eb;
}

.tutorial-btn svg {
  width: 16px;
  height: 16px;
}

/* 新規ユーザー作成セクション */
.create-user-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

.section-toggle {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-toggle:hover {
  background: #f9fafb;
  border-radius: 8px;
}

.create-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #9333ea;
}

.form-input.readonly {
  background: #f9fafb;
  color: #666;
  cursor: not-allowed;
}

.create-btn-form {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-btn-form:hover:not(:disabled) {
  background: #2563eb;
}

.create-btn-form:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ユーザー一覧セクション */
.user-list-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table thead {
  background: #f9fafb;
}

.user-table th {
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.user-table td {
  padding: 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.user-table tbody tr:hover {
  background: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.edit-btn {
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #2563eb;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>


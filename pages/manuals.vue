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

// 現在の組織
const currentOrganization = ref<string | null>(null)

// ユーザーメニューの表示状態
const showUserMenu = ref(false)

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
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
      // 組織情報を取得
      if (user.user_metadata?.organization) {
        currentOrganization.value = user.user_metadata.organization
      }
    }
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const navigateToEdit = () => {
  router.push('/edit')
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

// 動画とカテゴリのデータ
const videos = ref<Array<{
  id: number
  title: string
  video_url: string
  thumbnail_url: string | null
  category_id: number | null
  created_at: string
  is_watched?: boolean
}>>([])

const categories = ref<Array<{
  id: number
  name: string
  description: string | null
  created_at: string
}>>([])

const isLoadingVideos = ref(false)
const isLoadingCategories = ref(false)

// 選択されたカテゴリ（null = 未分類）
const selectedCategoryId = ref<number | null>(null)

// 動画を取得
const loadVideos = async () => {
  isLoadingVideos.value = true
  try {
    const queryParams: any = {}
    
    // 現在の組織が設定されている場合、組織でフィルタリング
    if (currentOrganization.value) {
      queryParams.organization = currentOrganization.value
    }
    
    console.log('[LoadVideos] Loading videos for organization:', currentOrganization.value)
    
    const data = await $fetch('/api/videos', {
      method: 'GET',
      query: queryParams
    })
    
    // 視聴履歴を取得
    let watchedVideoIds: number[] = []
    if (supabase && currentUser.value) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const watchHistory = await $fetch('/api/videos/watch-history', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          watchedVideoIds = (watchHistory || [])
            .filter((h: any) => h.is_completed)
            .map((h: any) => h.video_id)
        }
      } catch (error) {
        console.error('Error loading watch history:', error)
      }
    }
    
    // 動画に視聴済みフラグを追加
    videos.value = (data || []).map((video: any) => ({
      ...video,
      is_watched: watchedVideoIds.includes(video.id)
    }))
    
    console.log('[LoadVideos] Loaded videos:', videos.value.length, 'Watched:', watchedVideoIds.length)
  } catch (error) {
    console.error('Error loading videos:', error)
    videos.value = []
  } finally {
    isLoadingVideos.value = false
  }
}

// カテゴリを取得
const loadCategories = async () => {
  isLoadingCategories.value = true
  try {
    const queryParams: any = {}
    
    // 現在の組織が設定されている場合、組織でフィルタリング
    if (currentOrganization.value) {
      queryParams.organization = currentOrganization.value
    }
    
    console.log('[LoadCategories] Loading categories for organization:', currentOrganization.value)
    
    const data = await $fetch('/api/categories', {
      method: 'GET',
      query: queryParams
    })
    categories.value = data || []
    console.log('[LoadCategories] Loaded categories:', categories.value.length)
  } catch (error) {
    console.error('Error loading categories:', error)
    categories.value = []
  } finally {
    isLoadingCategories.value = false
  }
}

// 未分類の動画を取得
const uncategorizedVideos = computed(() => {
  return videos.value.filter(v => v.category_id === null)
})

// カテゴリごとの動画を取得
const getVideosByCategory = (categoryId: number) => {
  return videos.value.filter(v => v.category_id === categoryId)
}

// 選択されたカテゴリの動画を取得
const selectedCategoryVideos = computed(() => {
  if (selectedCategoryId.value === null) {
    return uncategorizedVideos.value
  } else {
    return getVideosByCategory(selectedCategoryId.value)
  }
})

// カテゴリを選択
const selectCategory = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
}

// カテゴリ作成
const showCreateCategoryModal = ref(false)
const newCategoryName = ref('')
const newCategoryDescription = ref('')

const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    alert('カテゴリ名を入力してください')
    return
  }

  if (!currentOrganization.value) {
    alert('組織情報が取得できませんでした。ページをリロードしてください。')
    return
  }

  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: {
        name: newCategoryName.value.trim(),
        description: newCategoryDescription.value.trim() || null,
        organization: currentOrganization.value
      }
    })
    
    newCategoryName.value = ''
    newCategoryDescription.value = ''
    showCreateCategoryModal.value = false
    await loadCategories()
    alert('カテゴリを作成しました')
  } catch (error: any) {
    console.error('Error creating category:', error)
    // Nuxtの$fetchエラーでは、エラーメッセージはerror.data.messageまたはerror.messageに含まれる
    const errorMessage = error?.data?.message || error?.message || 'Unknown error'
    console.error('Error details:', {
      message: errorMessage,
      statusCode: error?.statusCode,
      data: error?.data,
      fullError: error
    })
    alert('カテゴリの作成に失敗しました: ' + errorMessage)
  }
}

// 動画をカテゴリに移動
const moveVideoToCategory = async (videoId: number, categoryId: number | null) => {
  if (!videoId) return
  
  try {
    await $fetch(`/api/videos/${videoId}`, {
      method: 'PATCH',
      body: {
        category_id: categoryId
      }
    })
    await loadVideos()
    
    // 移動先のカテゴリを選択状態にする
    selectedCategoryId.value = categoryId
    
    if (categoryId) {
      const category = categories.value.find(c => c.id === categoryId)
      alert(`動画を「${category?.name || 'カテゴリ'}」に移動しました`)
    } else {
      alert('動画を未分類に移動しました')
    }
  } catch (error: any) {
    console.error('Error moving video:', error)
    alert('動画の移動に失敗しました: ' + (error.message || 'Unknown error'))
  }
}

// 日付をフォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// コンポーネントマウント時にユーザー情報を取得
onMounted(async () => {
  await loadCurrentUser()
  await loadVideos()
  loadCategories()
  document.addEventListener('click', handleClickOutside)
  // デフォルトで未分類を選択
  selectedCategoryId.value = null
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="manual-page">
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
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
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
          <NuxtLink to="/manuals" class="nav-item active">
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
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>サポート</span>
          </a>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="main-content">
        <!-- パンくずリスト -->
        <div class="breadcrumbs">
          <span>ホーム</span>
          <span class="separator">></span>
          <span>マニュアル</span>
        </div>

        <!-- ページタイトル -->
        <div class="page-header">
          <div class="page-title-section">
            <h1 class="page-title">マニュアル</h1>
            <button class="help-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </button>
            <a href="#" class="help-link">利用方法</a>
          </div>
          <div class="page-actions">
            <button class="action-btn">計画表を編集</button>
            <button class="action-btn tutorial-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-8 10 8M2 10v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6"/>
                <path d="M6 14h12"/>
              </svg>
              動画アップロードのチュートリアル
            </button>
          </div>
        </div>

        <!-- よく見るフォルダ -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">★よく見るフォルダ</h2>
            <button class="create-category-btn" @click="showCreateCategoryModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              カテゴリを作成
            </button>
          </div>
          <div class="folder-list">
            <div 
              class="folder-item" 
              :class="{ active: selectedCategoryId === null }"
              @click="selectCategory(null)"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="folder-icon" :class="selectedCategoryId === null ? 'blue' : 'gray'">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>未分類</span>
              <span class="folder-count">({{ uncategorizedVideos.length }})</span>
            </div>
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="folder-item"
              :class="{ active: selectedCategoryId === category.id }"
              @click="selectCategory(category.id)"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="folder-icon" :class="selectedCategoryId === category.id ? 'blue' : 'gray'">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ category.name }}</span>
              <span class="folder-count">({{ getVideosByCategory(category.id).length }})</span>
            </div>
          </div>
        </section>

        <!-- 選択されたカテゴリの動画を表示 -->
        <section class="section">
          <h2 class="section-title">
            {{ selectedCategoryId === null ? '未分類' : categories.find(c => c.id === selectedCategoryId)?.name || 'カテゴリ' }}
          </h2>
          <div v-if="selectedCategoryVideos.length === 0" class="empty-state">
            <p>{{ selectedCategoryId === null ? '未分類の動画はありません' : 'このカテゴリには動画がありません' }}</p>
          </div>
          <div v-else class="video-grid">
            <div 
              v-for="video in selectedCategoryVideos" 
              :key="video.id" 
              class="video-card"
              @click="router.push(`/videos/${video.id}`)"
            >
              <div class="video-thumbnail" :style="{ backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none' }">
                <svg v-if="!video.thumbnail_url" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="play-icon">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <span v-if="video.is_watched" class="watched-badge">視聴済み</span>
              <button class="bookmark-btn" @click.stop>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
              <h3 class="video-title">{{ video.title }}</h3>
              <p class="video-status published">公開 {{ formatDate(video.created_at) }}</p>
              <!-- 未分類の動画のみカテゴリ選択を表示 -->
              <div v-if="selectedCategoryId === null" class="video-actions" @click.stop>
                <select 
                  @change="(e) => {
                    const target = e.target as HTMLSelectElement
                    moveVideoToCategory(video.id, target.value ? parseInt(target.value) : null)
                  }"
                  class="category-select"
                >
                  <option value="">カテゴリを選択</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- カテゴリ作成モーダル -->
        <div v-if="showCreateCategoryModal" class="modal-overlay" @click="showCreateCategoryModal = false">
          <div class="modal-content" @click.stop>
            <h2>カテゴリを作成</h2>
            <div class="form-group">
              <label>カテゴリ名</label>
              <input v-model="newCategoryName" type="text" placeholder="例: 機械の操作系" class="form-input" />
            </div>
            <div class="form-group">
              <label>説明（任意）</label>
              <textarea v-model="newCategoryDescription" placeholder="カテゴリの説明" class="form-textarea"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" @click="showCreateCategoryModal = false">キャンセル</button>
              <button class="btn-primary" @click="createCategory">作成</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.manual-page {
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ヘッダー */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
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
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.search-bar {
  width: 100%;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #f5f5f5;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  position: relative;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f0f0f0;
}


.user-profile-container {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #f0f0f0;
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
  background: #3b82f6;
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
  min-height: calc(100vh - 73px);
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
  color: #999;
}

.nav-item.active svg {
  color: #9333ea;
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  padding: 32px 48px;
  background: #f5f5f5;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.separator {
  color: #999;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.help-icon {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-link {
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
}

.help-link:hover {
  text-decoration: underline;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
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
  gap: 8px;
}

.action-btn:hover {
  background: #2563eb;
}

.tutorial-btn {
  background: #3b82f6;
}

/* セクション */
.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

/* セクションヘッダー */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.create-category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.create-category-btn:hover {
  background: #2563eb;
}

.folder-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-item:hover {
  background: #f5f5f5;
  border-color: #3b82f6;
}

.folder-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
  border-width: 2px;
}

.folder-item.active .folder-icon {
  color: #3b82f6;
}

.folder-item.active span {
  color: #3b82f6;
  font-weight: 600;
}

.folder-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.folder-icon.blue {
  color: #3b82f6;
}

.folder-icon.gray {
  color: #666;
}

.folder-count {
  color: #999;
  font-size: 14px;
}

/* 空の状態 */
.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

/* 動画カードのアクション */
.video-actions {
  margin-top: 8px;
}

.category-select {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.category-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.folder-icon.gray {
  color: #999;
}

.folder-item span {
  font-size: 14px;
  color: #333;
}

/* 動画グリッド */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.video-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  position: relative;
  background-size: cover;
  background-position: center;
}

.play-icon {
  color: #999;
}

.watched-badge {
  position: absolute;
  top: 24px;
  left: 24px;
  background: #ef4444;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
}

.bookmark-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.bookmark-btn:hover {
  background: white;
  color: #3b82f6;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.video-status {
  font-size: 12px;
  margin: 0;
}

.video-status.published {
  color: #10b981;
}

.video-status.draft {
  color: #f59e0b;
}
</style>


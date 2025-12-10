<template>
  <div class="video-page">
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
          <NuxtLink to="/" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <span>コース</span>
          </NuxtLink>
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
            <span>設定</span>
          </a>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="content-area">
        <div v-if="isLoading" class="loading">
          <p>読み込み中...</p>
        </div>
        <div v-else-if="video" class="video-content">
          <!-- タイトルとアクションボタン -->
          <div class="video-header">
            <h1 class="video-title">{{ video.title }}</h1>
            <div class="video-actions-header">
              <button class="btn-secondary" @click="navigateToEdit">編集</button>
              <button class="btn-primary">書き出し</button>
            </div>
          </div>

          <!-- 動画プレーヤーとサイドバー -->
          <div class="video-main-section">
            <!-- 動画プレーヤー -->
            <div class="video-player-section">
              <div class="video-player-wrapper">
                <video 
                  :src="video.video_url" 
                  controls 
                  class="video-player"
                  @loadedmetadata="onVideoLoaded"
                >
                  お使いのブラウザは動画の再生をサポートしていません。
                </video>
              </div>
              
              <!-- 関連テスト -->
              <div class="related-test-box">
                <p>この動画に関連するテストがあります</p>
                <button class="btn-test">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  テストはこちら
                </button>
              </div>
            </div>

            <!-- 右サイドバー（設定） -->
            <aside class="video-settings-sidebar">
              <!-- カテゴリ -->
              <div class="settings-section">
                <label class="settings-label">カテゴリ</label>
                <select v-model="selectedCategoryId" class="settings-select">
                  <option :value="null">未分類</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <button class="btn-update" @click="updateCategory">カテゴリを更新</button>
              </div>

              <!-- タグ -->
              <div class="settings-section">
                <label class="settings-label">タグ ({{ tags.length }}/50)</label>
                <div v-if="tags.length === 0" class="empty-state-small">
                  タグがまだ追加されていません。
                </div>
                <div v-else class="tags-list">
                  <span v-for="tag in tags" :key="tag" class="tag-item">{{ tag }}</span>
                </div>
                <select v-model="selectedTag" class="settings-select">
                  <option value="">タグを選択...</option>
                  <option value="tag1">タグ1</option>
                  <option value="tag2">タグ2</option>
                </select>
                <button class="btn-update" @click="addTag">タグを追加</button>
              </div>

              <!-- 字幕 -->
              <div class="settings-section">
                <label class="settings-label">字幕</label>
                <p class="settings-description">手動アップロード(自動文字起こし/翻訳は後続で実装)</p>
                <input 
                  v-model="subtitleLanguage" 
                  type="text" 
                  placeholder="言語コード(例: ja, en)" 
                  class="settings-input"
                />
                <div class="file-upload-area">
                  <button class="btn-file-select" :class="{ 'has-file': subtitleFile }">
                    {{ subtitleFile ? '選択されています' : 'ファイルを選択' }}
                  </button>
                  <input 
                    type="file" 
                    accept=".vtt,.srt" 
                    @change="handleSubtitleFileSelect"
                    class="file-input"
                    id="subtitle-file-input"
                  />
                </div>
                <button class="btn-update" @click="addSubtitle">字幕を追加</button>
              </div>
            </aside>
          </div>
        </div>
        <div v-else class="error-state">
          <p>動画が見つかりませんでした</p>
          <button class="btn-secondary" @click="router.push('/')">コース一覧に戻る</button>
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

// 動画データ
const video = ref<{
  id: number
  title: string
  video_url: string
  thumbnail_url: string | null
  category_id: number | null
  created_at: string
} | null>(null)

const isLoading = ref(true)
const categories = ref<Array<{ id: number; name: string }>>([])
const selectedCategoryId = ref<number | null>(null)
const tags = ref<string[]>([])
const selectedTag = ref('')
const subtitleLanguage = ref('')
const subtitleFile = ref<File | null>(null)

// 動画を読み込む
const loadVideo = async () => {
  const videoId = route.params.id
  if (!videoId) {
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const videos = await $fetch('/api/videos', {
      method: 'GET'
    })
    const foundVideo = videos.find((v: any) => v.id === parseInt(videoId as string))
    
    if (foundVideo) {
      video.value = foundVideo
      selectedCategoryId.value = foundVideo.category_id
    }
  } catch (error) {
    console.error('Error loading video:', error)
  } finally {
    isLoading.value = false
  }
}

// カテゴリを読み込む
const loadCategories = async () => {
  try {
    const data = await $fetch('/api/categories', {
      method: 'GET'
    })
    categories.value = data || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// カテゴリを更新
const updateCategory = async () => {
  if (!video.value) return
  
  try {
    await $fetch(`/api/videos/${video.value.id}`, {
      method: 'PATCH',
      body: {
        category_id: selectedCategoryId.value
      }
    })
    alert('カテゴリを更新しました')
    await loadVideo()
  } catch (error: any) {
    console.error('Error updating category:', error)
    alert('カテゴリの更新に失敗しました: ' + (error.message || 'Unknown error'))
  }
}

// タグを追加
const addTag = () => {
  if (!selectedTag.value || tags.value.length >= 50) return
  if (!tags.value.includes(selectedTag.value)) {
    tags.value.push(selectedTag.value)
    selectedTag.value = ''
  }
}

// 字幕ファイルを選択
const handleSubtitleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    subtitleFile.value = file
  }
}

// 字幕を追加
const addSubtitle = () => {
  if (!subtitleLanguage.value || !subtitleFile.value) {
    alert('言語コードとファイルを選択してください')
    return
  }
  // TODO: 字幕アップロード機能を実装
  alert('字幕機能は今後実装予定です')
}

// 動画のメタデータが読み込まれた時
const onVideoLoaded = () => {
  // 動画の長さなどの情報を取得可能
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

onMounted(() => {
  loadCurrentUser()
  loadVideo()
  loadCategories()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.video-page {
  min-height: 100vh;
  background: #ffffff;
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

.menu-link {
  text-decoration: none;
  color: #3b82f6;
  border-top: 1px solid #e0e0e0;
}

.menu-link:hover {
  background: #f0f7ff;
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
  color: #999;
}

/* メインコンテンツ */
.content-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.loading, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.video-content {
  max-width: 1400px;
  margin: 0 auto;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.video-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.video-actions-header {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
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

.video-main-section {
  display: flex;
  gap: 24px;
}

.video-player-section {
  flex: 1;
}

.video-player-wrapper {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.video-player {
  width: 100%;
  height: auto;
  display: block;
}

.related-test-box {
  background: #e0f2fe;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-test-box p {
  margin: 0;
  color: #0369a1;
  font-size: 14px;
}

.btn-test {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-test:hover {
  background: #2563eb;
}

/* 右サイドバー（設定） */
.video-settings-sidebar {
  width: 320px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.settings-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.settings-select, .settings-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.settings-select:focus, .settings-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-update {
  width: 100%;
  padding: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-update:hover {
  background: #2563eb;
}

.empty-state-small {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag-item {
  display: inline-block;
  padding: 4px 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
}

.file-upload-area {
  position: relative;
  margin-bottom: 8px;
}

.btn-file-select {
  width: 100%;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  text-align: left;
}

.btn-file-select.has-file {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #3b82f6;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>


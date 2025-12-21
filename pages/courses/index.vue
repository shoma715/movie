<template>
  <div class="courses-page">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <div class="logo">マナベル</div>
      </div>
      <div class="header-center">
        <div class="search-bar">
          <input type="text" placeholder="Q キーワードで検索" class="search-input" v-model="searchQuery" />
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
            <div class="avatar">{{ getAvatarInitial(currentUser.displayName || currentUser.email || '') }}</div>
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
        <div class="create-btn-wrapper">
          <button class="create-btn" @click="navigateToEdit">
            <span>+ 作成</span>
          </button>
          <HelpTooltip
            title="作成ボタン"
            text="新しい動画マニュアルを作成します。"
            :features="[
              '動画をアップロードしてマニュアルを作成',
              '動画の編集（カット、一時停止、テキスト追加）',
              '自動文字起こしと字幕生成',
              '多言語字幕の追加'
            ]"
            placement="right"
          />
        </div>
        <nav class="nav-menu">
          <div class="nav-item-wrapper">
            <NuxtLink to="/home" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>ホーム</span>
            </NuxtLink>
            <HelpTooltip
              text="アプリケーションのホーム画面です。ダッシュボードや概要情報を確認できます。"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
            <a href="#" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>ブックマーク</span>
            </a>
            <HelpTooltip
              text="お気に入りの動画やマニュアルをブックマークして、後から簡単にアクセスできます。"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
            <NuxtLink to="/courses" class="nav-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              <span>コース</span>
            </NuxtLink>
            <HelpTooltip
              title="コース"
              text="複数の動画をまとめたコースを作成・管理できます。"
              :features="[
                'コースごとに進捗状況を確認',
                '視聴済みの動画を把握',
                'コース内の動画を整理'
              ]"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
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
            <HelpTooltip
              title="マニュアル"
              text="アップロード済みの動画を視聴・管理できます。"
              :features="[
                'カテゴリ別に整理',
                '視聴履歴の確認',
                '動画の検索とフィルタリング'
              ]"
              placement="right"
            />
          </div>
          <div v-if="currentUser && (currentUser.user_metadata?.role === 'org_admin' || currentUser.user_metadata?.role === 'organization_admin')" class="nav-item-wrapper">
            <NuxtLink to="/drafts" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>下書き</span>
            </NuxtLink>
            <HelpTooltip
              title="下書き"
              text="編集中の動画を一時保存できます。後から編集を再開できます。"
              :features="[
                '編集中の動画を保存',
                '後から編集を再開',
                '管理者のみ利用可能'
              ]"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
            <NuxtLink to="/tests" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>テスト</span>
            </NuxtLink>
            <HelpTooltip
              title="テスト"
              text="動画に関連したクイズ形式のテストを作成・編集します。"
              :features="[
                '学習効果を確認するための問題を作成',
                'テスト結果の確認',
                '複数選択問題や記述問題の設定'
              ]"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
            <a href="#" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>タグ</span>
            </a>
            <HelpTooltip
              text="動画やマニュアルにタグを付けて分類・検索しやすくします。"
              placement="right"
            />
          </div>
          <div v-if="currentUser && (currentUser.user_metadata?.role === 'org_admin' || currentUser.user_metadata?.role === 'organization_admin')" class="nav-item-wrapper">
            <NuxtLink to="/organization" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              <span>組織設定</span>
            </NuxtLink>
            <HelpTooltip
              title="組織設定"
              text="ユーザーの招待や権限（管理者/一般）の設定を行います。"
              :features="[
                '組織内のメンバー管理',
                'ユーザーの招待',
                '権限の設定'
              ]"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
            <a href="#" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span>組織レポート</span>
            </a>
            <HelpTooltip
              text="組織の利用状況や統計情報を確認できます。"
              placement="right"
            />
          </div>
          <div class="nav-item-wrapper">
            <a href="#" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>サポート</span>
            </a>
            <HelpTooltip
              text="ヘルプやサポート情報を確認できます。"
              placement="right"
            />
          </div>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="content-area">
        <div class="courses-content">
          <!-- ヘッダー -->
          <div class="page-header">
            <div class="page-title-wrapper">
              <h1 class="page-title">コース一覧</h1>
              <HelpTooltip
                text="複数の動画をまとめたコースを作成・管理できます。コースごとに進捗状況を確認し、視聴済みの動画を把握できます。"
                placement="right"
              />
            </div>
            <div v-if="isOrgAdmin" class="header-actions">
              <button 
                class="btn-create-course"
                @click="showCreateCourseModal = true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                コースを追加
              </button>
              <HelpTooltip
                title="コースを追加"
                text="新しいコースを作成します。コース名と説明を入力して、後から動画を追加できます。"
                placement="bottom"
              />
            </div>
          </div>

          <!-- コース一覧 -->
          <div v-if="isLoadingCourses" class="loading-state">
            <p>読み込み中...</p>
          </div>

          <div v-else-if="filteredCourses.length === 0" class="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <p>コースがまだ作成されていません</p>
            <p v-if="isOrgAdmin" class="empty-hint">「コースを追加」ボタンから新しいコースを作成できます</p>
          </div>

          <div v-else class="courses-list">
            <div 
              v-for="course in filteredCourses" 
              :key="course.id"
              class="course-card"
            >
              <div class="course-header">
                <h2 class="course-title">{{ course.name }}</h2>
                <div v-if="isOrgAdmin" class="course-actions">
                  <button 
                    class="action-btn add-content-btn"
                    @click="openAddContentModal(course)"
                    title="コンテンツを追加"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    コンテンツを追加
                  </button>
                  <button 
                    class="action-btn delete-btn"
                    @click="deleteCourse(course.id)"
                    title="コースを削除"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    コンテンツを削除
                  </button>
                </div>
              </div>

              <!-- 進捗表示 -->
              <div class="course-progress">
                <div class="progress-bar-wrapper">
                  <div 
                    class="progress-bar-fill" 
                    :style="{ width: `${course.progress?.percentage || 0}%` }"
                  ></div>
                </div>
                <span class="progress-text">
                  {{ course.progress?.completed || 0 }} / {{ course.progress?.total || 0 }} 完了
                  ({{ course.progress?.percentage || 0 }}%)
                </span>
              </div>

              <!-- 動画一覧（横スクロール） -->
              <div class="course-videos-scroll">
                <div class="course-videos-list">
                  <div
                    v-for="(video, index) in course.contents"
                    :key="video.id"
                    class="video-thumbnail-card"
                    @click="goToVideo(video.id)"
                  >
                    <div class="thumbnail-wrapper">
                      <img 
                        v-if="video.thumbnail_url" 
                        :src="video.thumbnail_url" 
                        :alt="video.title"
                        class="thumbnail-image"
                      />
                      <div v-else class="thumbnail-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                      <!-- 視聴済みバッジ -->
                      <div v-if="isVideoWatched(video.id)" class="watched-badge">
                        視聴済み
                      </div>
                      <!-- 削除ボタン（管理者のみ） -->
                      <button
                        v-if="isOrgAdmin"
                        class="delete-video-btn"
                        @click.stop="removeVideoFromCourse(course.id, video.id, index)"
                        title="この動画を削除"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <p class="video-title">{{ video.title }}</p>
                    <p class="video-date">
                      公開日 {{ formatDate(video.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- コース作成モーダル -->
    <div v-if="showCreateCourseModal" class="modal-overlay" @click="showCreateCourseModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>コースを追加</h2>
          <button class="close-btn" @click="showCreateCourseModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">コース名 <span class="required">*</span></label>
            <input 
              v-model="newCourseName" 
              type="text" 
              class="form-input" 
              placeholder="例: シーシャの作り方"
              @keyup.enter="createCourse"
            />
          </div>
          <div class="form-group">
            <label class="form-label">説明</label>
            <textarea 
              v-model="newCourseDescription" 
              class="form-textarea" 
              rows="3"
              placeholder="コースの説明を入力してください（任意）"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showCreateCourseModal = false">キャンセル</button>
          <button class="btn-confirm" @click="createCourse" :disabled="!newCourseName.trim() || isCreating">
            {{ isCreating ? '作成中...' : '作成' }}
          </button>
        </div>
      </div>
    </div>

    <!-- コンテンツ追加モーダル -->
    <div v-if="showAddContentModal && selectedCourse" class="modal-overlay" @click="showAddContentModal = false">
      <div class="modal-content modal-content-large" @click.stop>
        <div class="modal-header">
          <h2>コンテンツを追加 - {{ selectedCourse.name }}</h2>
          <button class="close-btn" @click="showAddContentModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingVideos" class="loading-message">
            <p>動画を読み込んでいます...</p>
          </div>
          <div v-else-if="availableVideos.length === 0" class="empty-message">
            <p>追加できる動画がありません</p>
          </div>
          <div v-else class="video-select-list">
            <div
              v-for="video in availableVideos"
              :key="video.id"
              class="video-select-item"
              :class="{ 'selected': selectedVideoIds.includes(video.id) }"
              @click="toggleVideoSelection(video.id)"
            >
              <div class="video-select-thumbnail">
                <img 
                  v-if="video.thumbnail_url" 
                  :src="video.thumbnail_url" 
                  :alt="video.title"
                />
                <div v-else class="video-select-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </div>
              <div class="video-select-info">
                <p class="video-select-title">{{ video.title }}</p>
                <p class="video-select-date">公開日 {{ formatDate(video.created_at) }}</p>
              </div>
              <div class="video-select-checkbox" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="selectedVideoIds.includes(video.id)"
                  @click.stop="toggleVideoSelection(video.id)"
                  @change.stop
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddContentModal = false">キャンセル</button>
          <button 
            class="btn-confirm" 
            @click="addVideosToCourse" 
            :disabled="selectedVideoIds.length === 0 || isAddingVideos"
          >
            {{ isAddingVideos ? '追加中...' : `選択した動画を追加 (${selectedVideoIds.length})` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const showUserMenu = ref(false)
const searchQuery = ref('')
const isLoadingCourses = ref(false)
const isOrgAdmin = ref(false)

// コースリスト
const courses = ref<Array<{
  id: number
  name: string
  description: string | null
  organization_id: string | null
  contents: Array<{
    id: number
    title: string
    video_url: string
    thumbnail_url: string | null
    created_at: string
  }>
  progress: {
    completed: number
    total: number
    percentage: number
  }
}>>([])

// 視聴済み動画IDのセット（進捗計算用）
const watchedVideoIds = ref<Set<number>>(new Set())

// モーダル関連
const showCreateCourseModal = ref(false)
const showAddContentModal = ref(false)
const selectedCourse = ref<{ id: number; name: string } | null>(null)
const newCourseName = ref('')
const newCourseDescription = ref('')
const isCreating = ref(false)
const isAddingVideos = ref(false)

// 動画選択関連
const availableVideos = ref<Array<{
  id: number
  title: string
  video_url: string
  thumbnail_url: string | null
  created_at: string
}>>([])
const isLoadingVideos = ref(false)
const selectedVideoIds = ref<number[]>([])

// フィルタリングされたコース
const filteredCourses = computed(() => {
  if (!searchQuery.value.trim()) {
    return courses.value
  }
  const query = searchQuery.value.toLowerCase()
  return courses.value.filter(course => 
    course.name.toLowerCase().includes(query) ||
    (course.description && course.description.toLowerCase().includes(query))
  )
})

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
}

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '.')
}

// 動画が視聴済みかチェック
const isVideoWatched = (videoId: number) => {
  return watchedVideoIds.value.has(videoId)
}

// コースリストを取得
const loadCourses = async () => {
  isLoadingCourses.value = true
  try {
    const queryParams: any = {}
    
    if (currentOrganization.value) {
      queryParams.organization = currentOrganization.value
    }
    
    const data = await $fetch('/api/courses', {
      method: 'GET',
      query: queryParams
    })
    
    courses.value = data as any
    console.log('[CoursesIndex] Loaded courses:', courses.value.length)
    
    // 視聴履歴を取得して視聴済み動画IDを収集
    await loadWatchHistory()
  } catch (error) {
    console.error('[CoursesIndex] Error loading courses:', error)
    courses.value = []
  } finally {
    isLoadingCourses.value = false
  }
}

// 視聴履歴を取得
const loadWatchHistory = async () => {
  if (!supabase) return

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const watchHistory = await $fetch('/api/videos/watch-history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    // 視聴済み（is_completed = true）の動画IDを収集
    const watchedIds = new Set<number>()
    if (Array.isArray(watchHistory)) {
      watchHistory.forEach((item: any) => {
        if (item.is_completed && item.video_id) {
          watchedIds.add(item.video_id)
        }
      })
    }
    watchedVideoIds.value = watchedIds
    console.log('[CoursesIndex] Loaded watch history:', watchedIds.size, 'watched videos')
  } catch (error) {
    console.error('[CoursesIndex] Error loading watch history:', error)
    // エラーが発生しても続行（視聴済みバッジが表示されないだけ）
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
      
      // 組織情報を取得
      if (user.user_metadata?.organization) {
        currentOrganization.value = user.user_metadata.organization
      }
      
      // 組織管理者かどうかをチェック
      const userRole = user.user_metadata?.role || user.app_metadata?.role
      isOrgAdmin.value = userRole === 'org_admin' || userRole === 'organization_admin'
    }
  } catch (error) {
    console.error('[CoursesIndex] Error loading user:', error)
  }
}

// コースを作成
const createCourse = async () => {
  if (!newCourseName.value.trim()) {
    alert('コース名を入力してください')
    return
  }

  if (!currentOrganization.value) {
    alert('組織情報が取得できませんでした。ページをリロードしてください。')
    return
  }

  try {
    isCreating.value = true
    
    await $fetch('/api/courses', {
      method: 'POST',
      body: {
        name: newCourseName.value.trim(),
        description: newCourseDescription.value.trim() || null,
        organization_id: currentOrganization.value
      }
    })
    
    alert('コースを作成しました')
    showCreateCourseModal.value = false
    newCourseName.value = ''
    newCourseDescription.value = ''
    await loadCourses()
  } catch (error: any) {
    console.error('[CoursesIndex] Error creating course:', error)
    alert('コースの作成に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  } finally {
    isCreating.value = false
  }
}

// コースを削除
const deleteCourse = async (courseId: number) => {
  if (!confirm('このコースを削除してもよろしいですか？コース内の動画は削除されません。')) {
    return
  }

  try {
    await $fetch(`/api/courses/${courseId}`, {
      method: 'DELETE'
    })
    
    alert('コースを削除しました')
    await loadCourses()
  } catch (error: any) {
    console.error('[CoursesIndex] Error deleting course:', error)
    alert('コースの削除に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  }
}

// コンテンツ追加モーダルを開く
const openAddContentModal = async (course: any) => {
  selectedCourse.value = { id: course.id, name: course.name }
  selectedVideoIds.value = []
  showAddContentModal.value = true
  await loadAvailableVideos(course.id)
}

// 利用可能な動画を読み込む（既にコースに追加されている動画を除外）
const loadAvailableVideos = async (courseId: number) => {
  isLoadingVideos.value = true
  try {
    const queryParams: any = {}
    
    if (currentOrganization.value) {
      queryParams.organization = currentOrganization.value
    }
    
    const allVideos = await $fetch('/api/videos', {
      method: 'GET',
      query: queryParams
    })
    
    // 既にコースに追加されている動画IDを取得
    const course = courses.value.find(c => c.id === courseId)
    const existingVideoIds = new Set(course?.contents.map(v => v.id) || [])
    
    // 既に追加されている動画を除外
    availableVideos.value = (allVideos as any[]).filter(v => !existingVideoIds.has(v.id))
  } catch (error) {
    console.error('[CoursesIndex] Error loading videos:', error)
    availableVideos.value = []
  } finally {
    isLoadingVideos.value = false
  }
}

// 動画選択をトグル
const toggleVideoSelection = (videoId: number) => {
  const index = selectedVideoIds.value.indexOf(videoId)
  if (index > -1) {
    selectedVideoIds.value.splice(index, 1)
  } else {
    selectedVideoIds.value.push(videoId)
  }
}

// 選択した動画をコースに追加
const addVideosToCourse = async () => {
  if (!selectedCourse.value || selectedVideoIds.value.length === 0) return

  try {
    isAddingVideos.value = true
    
    // 各動画を順番に追加
    for (let i = 0; i < selectedVideoIds.value.length; i++) {
      const videoId = selectedVideoIds.value[i]
      await $fetch(`/api/courses/${selectedCourse.value.id}/contents`, {
        method: 'POST',
        body: {
          video_id: videoId,
          order_index: i
        }
      })
    }
    
    alert(`${selectedVideoIds.value.length}個の動画を追加しました`)
    showAddContentModal.value = false
    selectedVideoIds.value = []
    await loadCourses()
  } catch (error: any) {
    console.error('[CoursesIndex] Error adding videos:', error)
    alert('動画の追加に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  } finally {
    isAddingVideos.value = false
  }
}

// コースから動画を削除
const removeVideoFromCourse = async (courseId: number, videoId: number, contentIndex: number) => {
  if (!confirm('この動画をコースから削除してもよろしいですか？')) {
    return
  }

  try {
    await $fetch(`/api/courses/${courseId}/contents`, {
      method: 'DELETE',
      query: {
        videoId: videoId.toString()
      }
    })
    
    alert('動画をコースから削除しました')
    await loadCourses()
  } catch (error: any) {
    console.error('[CoursesIndex] Error removing video:', error)
    alert('動画の削除に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  }
}

// 動画ページに遷移
const goToVideo = (videoId: number) => {
  router.push(`/videos/${videoId}`)
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
    console.error('[CoursesIndex] Logout error:', error)
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
  await loadCourses()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.courses-page {
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

.create-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.create-btn-wrapper:hover :deep(.help-icon-btn) {
  opacity: 1;
}

.create-btn {
  flex: 1;
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

.nav-item-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.nav-item-wrapper:hover :deep(.help-icon-btn) {
  opacity: 1;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 14px;
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
.content-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background: #f5f5f5;
}

.courses-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* ページヘッダー */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title-wrapper:hover :deep(.help-icon-btn) {
  opacity: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions:hover :deep(.help-icon-btn) {
  opacity: 1;
}

.btn-create-course {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create-course:hover {
  background: #7e22ce;
}

/* 読み込み中・空の状態 */
.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state svg {
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px;
  margin-top: 8px !important;
}

/* コースリスト */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.course-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.course-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.course-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-content-btn {
  background: #9333ea;
  color: white;
}

.add-content-btn:hover {
  background: #7e22ce;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
}

/* 進捗表示 */
.course-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.progress-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #9333ea;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

/* 動画一覧（横スクロール） */
.course-videos-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #9333ea #f5f5f5;
}

.course-videos-scroll::-webkit-scrollbar {
  height: 8px;
}

.course-videos-scroll::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.course-videos-scroll::-webkit-scrollbar-thumb {
  background: #9333ea;
  border-radius: 4px;
}

.course-videos-list {
  display: flex;
  gap: 16px;
  padding-bottom: 8px;
}

.video-thumbnail-card {
  flex-shrink: 0;
  width: 200px;
  cursor: pointer;
  transition: transform 0.2s;
}

.video-thumbnail-card:hover {
  transform: translateY(-4px);
}

.thumbnail-wrapper {
  position: relative;
  width: 200px;
  height: 112px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background: #1a1a1a;
}

.watched-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  z-index: 2;
}

.delete-video-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
}

.delete-video-btn:hover {
  background: rgba(220, 38, 38, 0.9);
}

.video-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-date {
  font-size: 12px;
  color: #999;
  margin: 0;
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
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-content-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #9333ea;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  background: #9333ea;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #7e22ce;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-message, .empty-message {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.video-select-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.video-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.video-select-item:hover {
  border-color: #9333ea;
  background: #f9fafb;
}

.video-select-item.selected {
  border-color: #9333ea;
  background: #f3e8ff;
}

.video-select-thumbnail {
  width: 80px;
  height: 45px;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-select-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-select-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background: #1a1a1a;
}

.video-select-info {
  flex: 1;
  min-width: 0;
}

.video-select-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-select-date {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.video-select-checkbox {
  flex-shrink: 0;
}

.video-select-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>


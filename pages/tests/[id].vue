<template>
  <div class="test-detail-page">
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
          <NuxtLink to="/tests" class="nav-item active">
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
      <main class="content-area">
        <div v-if="isLoading" class="loading">
          <p>読み込み中...</p>
        </div>
        <div v-else-if="testData" class="test-content">
          <!-- タイトルとアクションボタン -->
          <div class="test-header">
            <h1 class="test-title">{{ testData.title }}</h1>
            <div class="test-actions">
              <button class="btn-edit" @click="handleEdit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                編集
              </button>
              <button class="btn-back" @click="goBack">
                一覧に戻る
              </button>
            </div>
          </div>

          <!-- テスト情報 -->
          <div class="info-section">
            <div class="section-header">
              <div class="section-icon info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <h2 class="section-title">テスト情報</h2>
            </div>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">タイトル:</span>
                <span class="info-value">{{ testData.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">紐付く動画:</span>
                <NuxtLink :to="`/videos/${testData.videoId}`" class="video-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  {{ testData.videoTitle }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- 統計情報 -->
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-card stat-examinees">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">受験者数</div>
                  <div class="stat-value">{{ statistics.examineesCount }}<span class="stat-unit">名</span></div>
                </div>
              </div>
              <div class="stat-card stat-attempts">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">総受験回数</div>
                  <div class="stat-value">{{ statistics.totalAttempts }}<span class="stat-unit">回</span></div>
                </div>
              </div>
              <div class="stat-card stat-average">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">平均点</div>
                  <div class="stat-value">{{ statistics.averageScore.toFixed(1) }}<span class="stat-unit">点</span></div>
                </div>
              </div>
              <div class="stat-card stat-scores">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-label">最高/最低点</div>
                  <div class="stat-value">{{ statistics.highestScore.toFixed(1) }} / {{ statistics.lowestScore.toFixed(1) }}<span class="stat-unit">点</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 受験結果一覧 -->
          <div class="results-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <h2 class="section-title">受験結果一覧</h2>
              <div class="results-count">{{ testResults.length }}件</div>
            </div>
            <div v-if="testResults.length === 0" class="empty-state">
              <p>まだ誰も受験していません</p>
            </div>
            <div v-else class="results-table-container">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>社員名</th>
                    <th>メールアドレス</th>
                    <th>最大得点</th>
                    <th>テスト受験回数</th>
                    <th>動画視聴完了日時</th>
                    <th>テスト完了日時</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in testResults" :key="result.id">
                    <td>
                      <div class="user-cell">
                        <div class="avatar-small">{{ getAvatarInitial(result.userName) }}</div>
                        <span>{{ result.userName }}</span>
                      </div>
                    </td>
                    <td>{{ result.email }}</td>
                    <td>
                      <span :class="['score-badge', result.maxScore >= 80 ? 'score-high' : result.maxScore >= 50 ? 'score-medium' : 'score-low']">
                        {{ result.maxScore.toFixed(1) }}点
                      </span>
                    </td>
                    <td>{{ result.attemptCount }}回</td>
                    <td>{{ formatDateTime(result.videoCompletedAt) }}</td>
                    <td>{{ formatDateTime(result.testCompletedAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 問い一覧 -->
          <div class="questions-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <h2 class="section-title">問い一覧</h2>
              <div class="questions-count">{{ questions.length }}問</div>
            </div>
            <div v-if="questions.length === 0" class="empty-state">
              <p>問題がまだ追加されていません</p>
            </div>
            <div v-else class="questions-list">
              <div v-for="(question, index) in questions" :key="question.id" class="question-item">
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-content">
                  <div class="question-text">{{ question.text }}</div>
                  <div class="question-type-badge">{{ question.type }}</div>
                  <div class="question-choices">
                    <div 
                      v-for="(choice, choiceIndex) in question.choices" 
                      :key="choiceIndex"
                      :class="['choice-item', choice.isCorrect ? 'choice-correct' : '']"
                    >
                      <span class="choice-label">{{ String.fromCharCode(65 + choiceIndex) }}</span>
                      <span class="choice-text">{{ choice.text }}</span>
                      <span v-if="choice.isCorrect" class="choice-mark">✓ 正解</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="error-state">
          <p>テストが見つかりませんでした</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

const showUserMenu = ref(false)

// テストデータ
const testData = ref<{
  id: number
  title: string
  videoId: number
  videoTitle: string
} | null>(null)

const testResults = ref<Array<{
  id: number
  userId: string
  userName: string
  email: string
  maxScore: number
  attemptCount: number
  videoCompletedAt: string
  testCompletedAt: string
}>>([])

const questions = ref<Array<{
  id: number
  text: string
  type: string
  choices: Array<{
    text: string
    isCorrect: boolean
  }>
}>>([])

const isLoading = ref(true)

// 統計情報を計算
const statistics = computed(() => {
  if (testResults.value.length === 0) {
    return {
      examineesCount: 0,
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0
    }
  }

  const uniqueUsers = new Set(testResults.value.map(r => r.userId))
  const scores = testResults.value.map(r => r.maxScore)
  const totalAttempts = testResults.value.reduce((sum, r) => sum + r.attemptCount, 0)
  
  return {
    examineesCount: uniqueUsers.size,
    totalAttempts: totalAttempts,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores)
  }
})

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
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

// テストデータを読み込む
const loadTestData = async () => {
  const testId = route.params.id
  if (!testId) {
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    
    // とりあえず動画IDをテストIDとして使用
    // 将来的には動画からテストIDを取得するAPIを実装
    const videoId = parseInt(testId as string)
    
    // 動画情報を取得
    const videos = await $fetch('/api/videos', {
      method: 'GET'
    })
    const video = videos.find((v: any) => v.id === videoId)
    
    if (video) {
      testData.value = {
        id: videoId,
        title: `${video.title}の確認問題`,
        videoId: videoId,
        videoTitle: video.title
      }
      
      // テスト結果を読み込む（動画の視聴履歴から）
      await loadTestResults(videoId)
      
      // 問題を読み込む（とりあえずサンプルデータ）
      loadSampleQuestions()
    }
  } catch (error) {
    console.error('Error loading test data:', error)
  } finally {
    isLoading.value = false
  }
}

// テスト結果を読み込む
const loadTestResults = async (videoId: number) => {
  if (!supabase) return

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return
    }

    const response = await $fetch(`/api/videos/${videoId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    // 視聴履歴をテスト結果に変換
    // 動画を最後まで見たユーザーのみを表示
    testResults.value = (response || [])
      .filter((result: any) => result.completedAt) // 動画を最後まで見た人のみ
      .map((result: any, index: number) => ({
        id: index + 1,
        userId: result.userId,
        userName: result.userName,
        email: result.email,
        maxScore: Math.random() * 100, // とりあえずランダムなスコア（将来的にはテスト結果から取得）
        attemptCount: Math.floor(Math.random() * 5) + 1, // とりあえずランダムな受験回数（将来的にはテスト結果から取得）
        videoCompletedAt: result.completedAt, // 動画視聴完了日時
        testCompletedAt: result.completedAt // とりあえず動画完了日時と同じ（将来的にはテスト完了日時を取得）
      }))
  } catch (error) {
    console.error('Error loading test results:', error)
  }
}

// サンプル問題を読み込む
const loadSampleQuestions = () => {
  questions.value = [
    {
      id: 1,
      text: '日本の首都は?',
      type: '単一選択',
      choices: [
        { text: '東京', isCorrect: true },
        { text: '大阪', isCorrect: false },
        { text: '名古屋', isCorrect: false },
        { text: '福岡', isCorrect: false }
      ]
    }
  ]
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

const handleEdit = () => {
  // 編集機能は後で実装
  alert('編集機能は今後実装予定です')
}

const goBack = () => {
  if (testData.value) {
    router.push(`/videos/${testData.value.videoId}`)
  } else {
    router.push('/')
  }
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

onMounted(async () => {
  await loadCurrentUser()
  await loadTestData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.test-detail-page {
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
}

.loading, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.test-content {
  max-width: 1400px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.test-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.test-actions {
  display: flex;
  gap: 12px;
}

.btn-edit, .btn-back {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-back {
  background: #f5f5f5;
  color: #333;
}

.btn-back:hover {
  background: #e0e0e0;
}

/* セクション */
.info-section, .stats-section, .results-section, .questions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-icon {
  background: #3b82f6;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.results-count, .questions-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* テスト情報 */
.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.info-value {
  color: #333;
}

.video-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.video-link:hover {
  text-decoration: underline;
}

/* 統計情報 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: #f9fafb;
}

.stat-examinees {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-attempts {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-average {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-scores {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  color: white;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-unit {
  font-size: 14px;
  font-weight: 500;
  margin-left: 4px;
}

/* 受験結果一覧 */
.results-table-container {
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

.score-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.score-high {
  background: #10b981;
}

.score-medium {
  background: #f59e0b;
}

.score-low {
  background: #ef4444;
}

/* 問い一覧 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.question-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.question-type-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.question-choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.choice-correct {
  background: #d1fae5;
  border-color: #10b981;
}

.choice-label {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.choice-correct .choice-label {
  background: #10b981;
  color: white;
}

.choice-text {
  flex: 1;
  color: #333;
}

.choice-mark {
  color: #10b981;
  font-weight: 600;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>





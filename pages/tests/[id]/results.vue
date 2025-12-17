<template>
  <div class="test-results-page">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <div class="logo">VIVNAI</div>
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
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>データを読み込み中...</p>
        </div>

        <div v-else-if="!testInfo" class="error-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>テストが見つかりません</p>
          <p style="font-size: 14px; color: #999; margin-top: 8px;">
            テストID: {{ route.params.id }}<br>
            ブラウザのコンソールログを確認してください
          </p>
          <button class="btn-back" @click="router.push('/tests')">テスト一覧に戻る</button>
        </div>

        <div v-else class="results-content">
          <!-- ヘッダー -->
          <div class="page-header">
            <div>
              <h1 class="page-title">{{ testInfo.title }}</h1>
              <p class="page-subtitle">動画: {{ testInfo.videoTitle }}</p>
            </div>
            <button class="btn-back" @click="router.push('/tests')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              テスト一覧に戻る
            </button>
          </div>

          <!-- 統計情報 -->
          <div class="statistics-grid" v-if="statistics">
            <div class="stat-card">
              <div class="stat-icon users">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">受験者数</div>
                <div class="stat-value">{{ statistics.totalUsers }}人</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon attempts">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">総受験回数</div>
                <div class="stat-value">{{ statistics.totalAttempts }}回</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon score">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">平均得点</div>
                <div class="stat-value">{{ statistics.averageScore }} / {{ statistics.maxPossibleScore }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon pass">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">合格率 (60%以上)</div>
                <div class="stat-value">{{ statistics.passRate }}%</div>
              </div>
            </div>
          </div>

          <!-- 受験者一覧 -->
          <div class="results-section">
            <div class="section-header">
              <h2 class="section-title">受験者一覧</h2>
              <div class="section-actions">
                <button class="btn-export" @click="exportResults">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  エクスポート
                </button>
              </div>
            </div>

            <div v-if="filteredResults.length === 0" class="empty-state">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>まだ誰も受験していません</p>
            </div>

            <div v-else class="results-table-container">
              <table class="results-table">
                <thead>
                  <tr>
                    <th @click="sortBy('userName')">
                      社員名
                      <svg v-if="sortColumn === 'userName'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th @click="sortBy('email')">
                      メールアドレス
                      <svg v-if="sortColumn === 'email'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th @click="sortBy('attemptCount')">
                      受験回数
                      <svg v-if="sortColumn === 'attemptCount'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th @click="sortBy('maxScore')">
                      最高得点
                      <svg v-if="sortColumn === 'maxScore'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th @click="sortBy('averageScore')">
                      平均得点
                      <svg v-if="sortColumn === 'averageScore'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th @click="sortBy('averageTime')">
                      平均所要時間
                      <svg v-if="sortColumn === 'averageTime'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th @click="sortBy('lastAttemptDate')">
                      最終受験日
                      <svg v-if="sortColumn === 'lastAttemptDate'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline :points="sortDirection === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                      </svg>
                    </th>
                    <th>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in filteredResults" :key="result.userId">
                    <td>
                      <div class="user-cell">
                        <div class="avatar-small">{{ getAvatarInitial(result.userName) }}</div>
                        <span>{{ result.userName }}</span>
                      </div>
                    </td>
                    <td>{{ result.email }}</td>
                    <td>{{ result.attemptCount }}回</td>
                    <td>
                      <span :class="['score-badge', getScoreClass(result.maxScore, statistics?.maxPossibleScore || 0)]">
                        {{ result.maxScore }} / {{ statistics?.maxPossibleScore || 0 }}
                      </span>
                    </td>
                    <td>{{ result.averageScore }}</td>
                    <td>{{ formatTime(result.averageTime) }}</td>
                    <td>{{ formatDate(result.lastAttemptDate) }}</td>
                    <td>
                      <button class="btn-detail" @click="showUserDetail(result)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ユーザー詳細モーダル -->
          <div v-if="selectedUser" class="modal-overlay" @click="closeUserDetail">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3 class="modal-title">{{ selectedUser.userName }} の受験履歴</h3>
                <button class="btn-close" @click="closeUserDetail">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <div class="user-summary">
                  <div class="summary-item">
                    <span class="summary-label">総受験回数:</span>
                    <span class="summary-value">{{ selectedUser.attemptCount }}回</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">最高得点:</span>
                    <span class="summary-value">{{ selectedUser.maxScore }} / {{ statistics?.maxPossibleScore || 0 }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">平均得点:</span>
                    <span class="summary-value">{{ selectedUser.averageScore }}</span>
                  </div>
                </div>

                <h4 class="attempts-title">受験履歴</h4>
                <div class="attempts-list">
                  <div 
                    v-for="(attempt, index) in selectedUser.attempts" 
                    :key="attempt.attemptId"
                    class="attempt-item"
                  >
                    <div class="attempt-number">{{ index + 1 }}回目</div>
                    <div class="attempt-details">
                      <div class="attempt-score">
                        得点: <strong>{{ attempt.score }} / {{ attempt.maxScore }}</strong>
                      </div>
                      <div class="attempt-time">
                        所要時間: {{ formatTime(attempt.elapsedTime) }}
                      </div>
                      <div class="attempt-date">
                        {{ formatDateTime(attempt.completedAt) }}
                      </div>
                    </div>
                    <div :class="['attempt-badge', getScoreClass(attempt.score, attempt.maxScore)]">
                      {{ Math.round((attempt.score / attempt.maxScore) * 100) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

definePageMeta({
  name: 'test-results'
})

const route = useRoute()
const router = useRouter()

// Supabaseクライアント
const config = useRuntimeConfig()
const supabaseUrl = config.public?.supabase?.url || ''
const supabaseKey = config.public?.supabase?.key || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const currentUser = ref<{
  email?: string
  displayName?: string
  user_metadata?: any
} | null>(null)

const showUserMenu = ref(false)
const isLoading = ref(true)
const searchQuery = ref('')
const sortColumn = ref('lastAttemptDate')
const sortDirection = ref<'asc' | 'desc'>('desc')
const selectedUser = ref<any>(null)

const testInfo = ref<{
  id: number
  title: string
  videoTitle: string
  videoId: number
} | null>(null)

const statistics = ref<{
  totalUsers: number
  totalAttempts: number
  averageScore: number
  maxPossibleScore: number
  passRate: number
} | null>(null)

const results = ref<Array<any>>([])

// フィルタリングされた結果
const filteredResults = computed(() => {
  let filtered = results.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.userName.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query)
    )
  }

  // ソート
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 得点のクラスを取得
const getScoreClass = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return 'score-high'
  if (percentage >= 60) return 'score-medium'
  return 'score-low'
}

// 時間フォーマット
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 日時フォーマット
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ソート
const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
}

// ユーザー詳細を表示
const showUserDetail = (user: any) => {
  selectedUser.value = user
}

// ユーザー詳細を閉じる
const closeUserDetail = () => {
  selectedUser.value = null
}

// 結果をエクスポート
const exportResults = () => {
  // CSV形式でエクスポート
  const headers = ['社員名', 'メールアドレス', '受験回数', '最高得点', '平均得点', '平均所要時間', '最終受験日']
  const rows = filteredResults.value.map(r => [
    r.userName,
    r.email,
    r.attemptCount,
    `${r.maxScore}/${statistics.value?.maxPossibleScore}`,
    r.averageScore,
    formatTime(r.averageTime),
    formatDate(r.lastAttemptDate)
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `test_results_${testInfo.value?.id}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// ユーザー情報を取得
const loadCurrentUser = async () => {
  if (!supabase) {
    console.error('[TestResults] Supabase client not available')
    return
  }

  try {
    console.log('[TestResults] Loading current user...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[TestResults] User loaded:', user?.email)
    
    if (user) {
      currentUser.value = {
        email: user.email || '',
        displayName: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || '',
        user_metadata: user.user_metadata
      }

      // 組織管理者かどうかをチェック
      const userRole = user.user_metadata?.role || user.app_metadata?.role
      console.log('[TestResults] User role:', userRole)
      console.log('[TestResults] User organization:', user.user_metadata?.organization)
      
      if (userRole !== 'org_admin' && userRole !== 'organization_admin') {
        console.error('[TestResults] User is not an organization admin')
        alert('テスト結果の閲覧は組織管理者のみ可能です')
        router.push('/tests')
        return
      }
      console.log('[TestResults] User is authorized as organization admin')
    } else {
      console.error('[TestResults] No user found, redirecting to login')
      router.push('/login')
    }
  } catch (error) {
    console.error('[TestResults] Error loading user:', error)
    router.push('/login')
  }
}

// テスト結果を取得
const loadTestResults = async () => {
  const testId = route.params.id
  console.log('[TestResults] Loading results for test ID:', testId)
  
  if (!testId || !supabase) {
    console.error('[TestResults] Missing testId or supabase')
    isLoading.value = false
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('[TestResults] No session found')
      router.push('/login')
      return
    }

    console.log('[TestResults] Fetching from API...')
    const data = await $fetch(`/api/tests/${testId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    }) as any

    console.log('[TestResults] API response:', data)

    testInfo.value = data.test
    statistics.value = data.statistics
    results.value = data.results

    console.log('[TestResults] Loaded results:', results.value.length)
    console.log('[TestResults] Test info:', testInfo.value)
    console.log('[TestResults] Statistics:', statistics.value)
  } catch (error: any) {
    console.error('[TestResults] Error loading test results:', error)
    console.error('[TestResults] Error details:', error.data || error.message)
    alert('テスト結果の読み込みに失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  } finally {
    isLoading.value = false
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

onMounted(async () => {
  try {
    console.log('[TestResults] Component mounted!')
    console.log('[TestResults] Route params:', route.params)
    console.log('[TestResults] Test ID from route:', route.params.id)
    
    await loadCurrentUser()
    console.log('[TestResults] User loaded, proceeding to load test results')
    
    await loadTestResults()
    console.log('[TestResults] Test results loaded')
    
    document.addEventListener('click', handleClickOutside)
  } catch (error) {
    console.error('[TestResults] Error in onMounted:', error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 基本スタイルは他のページと同じ */
.test-results-page {
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
  background: #f5f5f5;
}

/* ローディング・エラー */
.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #9333ea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 20px;
}

.error-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e0e0e0;
}

/* 結果コンテンツ */
.results-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 統計情報 */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.users {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-icon.attempts {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  color: white;
}

.stat-icon.score {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-icon.pass {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

/* 受験者一覧 */
.results-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f7ff;
  color: #3b82f6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-export:hover {
  background: #dbeafe;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state svg {
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* テーブル */
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
  font-size: 13px;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.results-table th:hover {
  background: #f3f4f6;
}

.results-table th svg {
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
}

.results-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.score-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.score-high {
  background: #d1fae5;
  color: #10b981;
}

.score-medium {
  background: #fef3c7;
  color: #f59e0b;
}

.score-low {
  background: #fee2e2;
  color: #ef4444;
}

.btn-detail {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f7ff;
  color: #3b82f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-detail:hover {
  background: #dbeafe;
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #e0e0e0;
}

.modal-body {
  padding: 24px;
}

.user-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 13px;
  color: #666;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.attempts-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.attempts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attempt-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.attempt-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #9333ea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.attempt-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attempt-score {
  font-size: 14px;
  color: #333;
}

.attempt-time, .attempt-date {
  font-size: 13px;
  color: #666;
}

.attempt-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}
</style>


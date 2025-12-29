<template>
  <div class="test-results-page">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <div class="logo">マナベル</div>
      </div>
      <div class="header-right">
        <div class="user-profile-container">
          <div 
            v-if="currentUser" 
            class="user-profile" 
            @click="showUserMenu = !showUserMenu"
          >
            <div class="avatar">{{ getAvatarInitial(currentUser.displayName || currentUser.email) }}</div>
            <span class="username">{{ currentUser.displayName || currentUser.email?.split('@')[0] || 'ユーザー' }}</span>
          </div>
          
          <div v-if="showUserMenu" class="user-menu">
            <button class="menu-item" @click="handleLogout">
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <!-- サイドバー -->
      <aside class="sidebar">
        <button class="create-btn" @click="router.push('/edit')">
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
            <span>設定</span>
          </a>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="content-area">
        <div v-if="isLoading" class="loading-state">
          <p>データを読み込み中...</p>
        </div>

        <div v-else-if="!testInfo" class="error-state">
          <p>テストが見つかりません</p>
          <p style="font-size: 14px; color: #999; margin-top: 8px;">
            テストID: {{ route.params.id }}
          </p>
          <button class="btn-back" @click="router.push('/tests')">テスト一覧に戻る</button>
        </div>

        <div v-else class="results-content">
          <!-- タブナビゲーション -->
          <div class="tabs-container">
            <button class="tab-button active">
              📊 一般ユーザ
            </button>
          </div>

          <!-- テスト情報カード -->
          <div class="info-card">
            <div class="info-header">
              <span class="info-icon">📝</span>
              <h2 class="info-title">テスト情報</h2>
            </div>
            <div class="info-content">
              <div class="info-row">
                <div class="info-item">
                  <div class="info-label">タイトル</div>
                  <div class="info-value">{{ testInfo.title }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">紐付く動画</div>
                  <div class="info-value info-link" @click="navigateToVideo">
                    📺 {{ testInfo.videoTitle }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 統計情報 -->
          <div class="stats-header">
            <span class="stats-icon">📊</span>
            <h2 class="stats-title">統計情報</h2>
          </div>
          <div class="statistics-grid" v-if="statistics">
            <div class="stat-card stat-blue">
              <div class="stat-label">受験者数</div>
              <div class="stat-value">{{ statistics.totalUsers }}</div>
            </div>

            <div class="stat-card stat-green">
              <div class="stat-label">総受験回数</div>
              <div class="stat-value">{{ statistics.totalAttempts }}</div>
            </div>

            <div class="stat-card stat-orange">
              <div class="stat-label">平均得点</div>
              <div class="stat-value">{{ statistics.averageScore }} / {{ statistics.maxPossibleScore }}</div>
            </div>

            <div class="stat-card stat-purple">
              <div class="stat-label">合格率</div>
              <div class="stat-value">{{ statistics.passRate }}%</div>
            </div>
          </div>

          <!-- 受験結果一覧 -->
          <div class="results-section">
            <div class="section-header">
              <span class="section-icon">📋</span>
              <h2 class="section-title">受験結果一覧</h2>
              <span class="section-badge">{{ displayedResults.length }}</span>
              <div class="view-toggle-buttons">
                <button 
                  :class="['view-toggle-btn', 'view-toggle-test', { active: !showAllEmployees }]"
                  @click="showAllEmployees = false"
                >
                  テスト受講者のみ
                </button>
                <button 
                  :class="['view-toggle-btn', 'view-toggle-all', { active: showAllEmployees }]"
                  @click="showAllEmployees = true"
                >
                  全従業員表示
                </button>
              </div>
            </div>

            <div v-if="filteredResults.length === 0" class="empty-state">
              <p>まだ誰も受験していません</p>
            </div>

            <div v-else class="results-table-container">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>社員名</th>
                    <th>メールアドレス</th>
                    <th>最大得点</th>
                    <th>何回テストを受けたか</th>
                    <th>動画を見終わった日時時刻</th>
                    <th>テスト終わった日時</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in displayedResults" :key="result.userId" class="result-row">
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar">{{ getAvatarInitial(result.userName) }}</div>
                        <span class="user-name">{{ result.userName }}</span>
                      </div>
                    </td>
                    <td class="email-cell">{{ result.email }}</td>
                    <td>
                      <span v-if="result.maxScore !== null && result.maxScore !== undefined" :class="['score-badge', getScoreClass(result.maxScore, statistics?.maxPossibleScore || 0)]">
                        {{ result.maxScore }} / {{ statistics?.maxPossibleScore || 0 }}
                      </span>
                      <span v-else class="no-data">-</span>
                    </td>
                    <td>
                      <span v-if="result.attemptCount > 0">{{ result.attemptCount }}回</span>
                      <span v-else class="no-data">-</span>
                    </td>
                    <td>
                      <span v-if="result.videoCompletedAt">{{ formatDateTime(result.videoCompletedAt) }}</span>
                      <span v-else class="no-data">-</span>
                    </td>
                    <td>
                      <span v-if="result.lastAttemptDate">{{ formatDateTime(result.lastAttemptDate) }}</span>
                      <span v-else class="no-data">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="shouldShowMoreButton" class="show-more-container">
                <button class="show-more-button" @click="showAllResults = true">
                  もっと見る
                </button>
              </div>
            </div>
          </div>

          <!-- 問い一覧 -->
          <div class="questions-section">
            <div class="section-header">
              <span class="section-icon">❓</span>
              <h2 class="section-title">問い一覧</h2>
              <span class="section-badge">{{ testQuestions.length }}</span>
            </div>

            <div v-if="testQuestions.length === 0" class="empty-state">
              <p>問題がありません</p>
            </div>

            <div v-else class="questions-list">
              <div v-for="(question, index) in testQuestions" :key="question.id" class="question-item">
                <div class="question-header" @click="toggleQuestion(question.id)">
                  <div class="question-number">{{ index + 1 }}</div>
                  <div class="question-text">{{ question.question_text }}</div>
                  <div class="question-badge" v-if="question.question_type === 'multiple_choice'">単一回答</div>
                  <div class="question-badge" v-else>複数回答</div>
                  <div class="question-toggle">
                    {{ expandedQuestions.has(question.id) ? '▼' : '▶' }}
                  </div>
                </div>
                
                <div v-if="expandedQuestions.has(question.id)" class="question-content">
                  <div class="options-title">選択肢:</div>
                  <div class="options-list">
                    <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item">
                      <div class="option-number">{{ optionIndex + 1 }}</div>
                      <div class="option-text">{{ option.text || option }}</div>
                      <div v-if="isCorrectOption(question, option)" class="option-correct">✓ 正解</div>
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
const testQuestions = ref<Array<any>>([])
const expandedQuestions = ref<Set<number>>(new Set())
const showAllResults = ref(false)
const showAllEmployees = ref(false)
const allEmployees = ref<Array<{
  id: string
  email: string
  displayName: string
}>>([])
const isLoadingEmployees = ref(false)
const allEmployeesWatchHistory = ref<Map<string, string>>(new Map())

// 組織管理者かどうか
const isOrgAdmin = computed(() => {
  const role = currentUser.value?.user_metadata?.role
  return role === 'org_admin' || role === 'organization_admin'
})

// フィルタリングされた結果
const filteredResults = computed(() => results.value)

// 表示する結果（全従業員表示モードの場合は全従業員とマージ、そうでない場合はテスト受講者のみ）
const displayedResults = computed(() => {
  if (showAllEmployees.value) {
    // 全従業員表示モード
    const resultsMap = new Map<string, any>()
    filteredResults.value.forEach(result => {
      resultsMap.set(result.userId, result)
    })
    
    // 全従業員とテスト結果をマージ
    const mergedResults = allEmployees.value.map(employee => {
      const testResult = resultsMap.get(employee.id)
      if (testResult) {
        // テスト結果がある場合はそのまま使用
        return testResult
      } else {
        // テスト結果がない場合は空のデータを返す
        // 動画視聴履歴がある場合はそれを使用
        const watchCompletedAt = allEmployeesWatchHistory.value.get(employee.id) || null
        return {
          userId: employee.id,
          userName: employee.displayName,
          email: employee.email,
          maxScore: null,
          attemptCount: 0,
          videoCompletedAt: watchCompletedAt,
          lastAttemptDate: null
        }
      }
    })
    
    // 全従業員表示モードの場合は常に全員を表示
    return mergedResults
  } else {
    // テスト受講者のみ表示モード
    if (showAllResults.value) {
      return filteredResults.value
    }
    return filteredResults.value.slice(0, 5)
  }
})

// もっと見るボタンを表示するかどうか（5人以上の場合、全従業員表示モードでは表示しない）
const shouldShowMoreButton = computed(() => {
  // 全従業員表示モードの場合は常にfalse
  if (showAllEmployees.value) {
    return false
  }
  // テスト受講者のみ表示モードで、5人以上かつまだ全員表示していない場合のみ表示
  return filteredResults.value.length > 5 && !showAllResults.value
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

// 問題の展開/折りたたみ
const toggleQuestion = (questionId: number) => {
  if (expandedQuestions.value.has(questionId)) {
    expandedQuestions.value.delete(questionId)
  } else {
    expandedQuestions.value.add(questionId)
  }
}

// 正解の選択肢かどうか
const isCorrectOption = (question: any, option: any) => {
  // optionオブジェクトにis_correctプロパティがある場合はそれを使用
  if (option.is_correct !== undefined) {
    return option.is_correct
  }
  // フォールバック: correct_answerと比較
  const optionText = option.text || option
  if (Array.isArray(question.correct_answer)) {
    return question.correct_answer.includes(optionText)
  }
  return question.correct_answer === optionText
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

// 全従業員を取得
const loadAllEmployees = async () => {
  if (!supabase || !currentUser.value || !testInfo.value) {
    console.error('[TestResults] Missing supabase, currentUser, or testInfo')
    return
  }

  try {
    isLoadingEmployees.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('[TestResults] No session found')
      return
    }

    const userOrganization = currentUser.value.user_metadata?.organization || '自組織 (ID: 2)'
    console.log('[TestResults] Loading all employees for organization:', userOrganization)

    const employees = await $fetch('/api/users', {
      method: 'GET',
      query: {
        organization: userOrganization
      }
    }) as any[]

    console.log('[TestResults] Loaded employees:', employees.length)
    allEmployees.value = employees.map(emp => ({
      id: emp.id || emp.uuid,
      email: emp.email || '',
      displayName: emp.displayName || emp.user_metadata?.display_name || emp.user_metadata?.username || emp.email?.split('@')[0] || 'Unknown'
    }))

    // 全従業員の動画視聴履歴も取得
    await loadAllEmployeesWatchHistory()
  } catch (error: any) {
    console.error('[TestResults] Error loading all employees:', error)
    allEmployees.value = []
  } finally {
    isLoadingEmployees.value = false
  }
}

// 全従業員の動画視聴履歴を取得
const loadAllEmployeesWatchHistory = async () => {
  if (!supabase || !currentUser.value || !testInfo.value) {
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return
    }

    const videoId = testInfo.value.videoId
    console.log('[TestResults] Loading watch history for video ID:', videoId)

    const watchHistory = await $fetch(`/api/videos/${videoId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    }) as any[]

    console.log('[TestResults] Loaded watch history:', watchHistory.length)
    
    // ユーザーIDをキーとしたマップを作成
    const historyMap = new Map<string, string>()
    watchHistory.forEach(history => {
      if (history.completedAt) {
        historyMap.set(history.userId, history.completedAt)
      }
    })
    
    allEmployeesWatchHistory.value = historyMap
  } catch (error: any) {
    console.error('[TestResults] Error loading watch history:', error)
    allEmployeesWatchHistory.value = new Map()
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
    
    // テスト問題を読み込む
    await loadTestQuestions(data.test.id)
    
    // 全従業員も読み込む（全従業員表示モードで使用）
    await loadAllEmployees()
  } catch (error: any) {
    console.error('[TestResults] Error loading test results:', error)
    alert('テスト結果の読み込みに失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  } finally {
    isLoading.value = false
  }
}

// テスト問題を読み込む
const loadTestQuestions = async (testId: number) => {
  if (!supabase) {
    console.error('[TestResults] Supabase client not available')
    return
  }

  try {
    console.log('[TestResults] Loading test questions for test ID:', testId)
    
    // テスト問題を取得
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('question_order', { ascending: true })
    
    if (questionsError) {
      console.error('[TestResults] Error loading questions:', questionsError)
      return
    }
    
    if (!questions || questions.length === 0) {
      console.log('[TestResults] No questions found')
      testQuestions.value = []
      return
    }
    
    // 各問題の選択肢を取得
    const questionsWithChoices = await Promise.all(
      questions.map(async (question) => {
        const { data: choices, error: choicesError } = await supabase
          .from('test_choices')
          .select('*')
          .eq('question_id', question.id)
          .order('choice_order', { ascending: true })
        
        if (choicesError) {
          console.error('[TestResults] Error loading choices for question:', question.id, choicesError)
          return {
            ...question,
            options: [],
            correct_answer: []
          }
        }
        
        // 選択肢を整形
        const options = choices?.map(choice => ({
          text: choice.choice_text,
          is_correct: choice.is_correct
        })) || []
        
        // 正解の選択肢を取得
        const correctAnswers = choices
          ?.filter(choice => choice.is_correct)
          .map(choice => choice.choice_text) || []
        
        return {
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type === 'single' ? 'multiple_choice' : 'multiple_select',
          options: options,
          correct_answer: question.question_type === 'single' 
            ? (correctAnswers[0] || '') 
            : correctAnswers,
          order_number: question.question_order
        }
      })
    )
    
    testQuestions.value = questionsWithChoices
    console.log('[TestResults] Loaded questions:', testQuestions.value.length)
  } catch (error) {
    console.error('[TestResults] Error loading test questions:', error)
  }
}

// 動画ページへ遷移
const navigateToVideo = () => {
  if (testInfo.value?.videoId) {
    router.push(`/videos/${testInfo.value.videoId}`)
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
.test-results-page {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.create-btn:hover {
  background: #7c2dc7;
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
  padding: 12px 16px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #9333ea;
}

.nav-item:hover svg {
  stroke: #9333ea;
}

.nav-item.active {
  background: #f3e8ff;
  color: #9333ea;
  font-weight: 600;
}

.nav-item.active svg {
  stroke: #9333ea;
}

.content-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background: #f5f5f5;
}

.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
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

.results-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* タブナビゲーション */
.tabs-container {
  margin-bottom: 24px;
}

.tab-button {
  padding: 12px 24px;
  background: #5b8ff9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #4a7dd8;
}

/* テスト情報カード */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.info-icon {
  font-size: 20px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.info-content {
  padding-left: 28px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-link {
  color: #5b8ff9;
  cursor: pointer;
  transition: color 0.2s;
}

.info-link:hover {
  color: #4a7dd8;
  text-decoration: underline;
}

/* 統計情報 */
.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stats-icon {
  font-size: 20px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 8px;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-blue {
  background: linear-gradient(135deg, #5b8ff9 0%, #4a7dd8 100%);
}

.stat-green {
  background: linear-gradient(135deg, #5ad8a6 0%, #3ec794 100%);
}

.stat-orange {
  background: linear-gradient(135deg, #f6bd16 0%, #e5a505 100%);
}

.stat-purple {
  background: linear-gradient(135deg, #9661bc 0%, #7d4fa3 100%);
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

/* 受験結果一覧 */
.results-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.view-toggle-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.view-toggle-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.view-toggle-test {
  background: #f87171;
}

.view-toggle-test:hover {
  background: #ef4444;
}

.view-toggle-test.active {
  background: #dc2626;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
}

.view-toggle-all {
  background: #60a5fa;
}

.view-toggle-all:hover {
  background: #3b82f6;
}

.view-toggle-all.active {
  background: #2563eb;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.section-icon {
  font-size: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.section-badge {
  background: #f5f5f5;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.results-table-container {
  overflow-x: auto;
}

.show-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 16px;
}

.show-more-button {
  padding: 12px 32px;
  background: #5b8ff9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.show-more-button:hover {
  background: #4a7dd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(91, 143, 249, 0.3);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table thead {
  background: #f9fafb;
}

.results-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.results-table td {
  padding: 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}

.result-row:hover {
  background: #fafafa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #5b8ff9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.email-cell {
  color: #666;
  font-size: 13px;
}

.no-data {
  color: #999;
  font-style: italic;
}

.score-badge {
  display: inline-block;
  padding: 6px 12px;
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

/* 問い一覧 */
.questions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.question-item:hover {
  border-color: #5b8ff9;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  cursor: pointer;
  transition: background 0.2s;
}

.question-header:hover {
  background: #f5f5f5;
}

.question-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #5b8ff9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.question-badge {
  padding: 4px 12px;
  border-radius: 12px;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 11px;
  font-weight: 600;
}

.question-toggle {
  color: #999;
  font-size: 12px;
}

.question-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.options-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.option-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.option-correct {
  padding: 4px 8px;
  border-radius: 4px;
  background: #d1fae5;
  color: #10b981;
  font-size: 11px;
  font-weight: 600;
}
</style>


<template>
  <div class="test-take-page">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <div class="logo">VIVNAI</div>
      </div>
      <div class="header-center">
        <h1 class="test-title">{{ testData?.title || 'テスト' }}</h1>
      </div>
      <div class="header-right">
        <div class="timer" v-if="!isCompleted && !isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{{ formatTime(elapsedTime) }}</span>
        </div>
      </div>
    </header>

    <div class="main-content">
      <!-- ローディング -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>テストを読み込み中...</p>
      </div>

      <!-- エラー -->
      <div v-else-if="!testData" class="error-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>テストが見つかりません</p>
        <button class="btn-back" @click="router.push('/tests')">テスト一覧に戻る</button>
      </div>

      <!-- テスト完了 -->
      <div v-else-if="isCompleted" class="completion-state">
        <div class="completion-card">
          <div class="completion-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 class="completion-title">テスト完了！</h2>
          <p class="completion-message">お疲れ様でした。回答を送信しました。</p>
          
          <div class="score-display">
            <div class="score-label">得点</div>
            <div class="score-value">{{ score }} / {{ maxScore }}</div>
            <div class="score-percentage">{{ scorePercentage }}%</div>
          </div>

          <div class="completion-actions">
            <button class="btn-review" @click="showReview = true" v-if="!showReview">
              回答を確認
            </button>
            <button class="btn-home" @click="router.push('/')">
              ホームに戻る
            </button>
          </div>
        </div>

        <!-- 回答レビュー -->
        <div v-if="showReview" class="review-section">
          <h3 class="review-title">回答の確認</h3>
          <div 
            v-for="(question, qIndex) in testData.questions" 
            :key="question.id"
            class="review-question"
          >
            <div class="review-question-header">
              <span class="review-question-number">問い {{ qIndex + 1 }}</span>
              <span 
                :class="['review-result', isQuestionCorrect(question) ? 'correct' : 'incorrect']"
              >
                {{ isQuestionCorrect(question) ? '正解' : '不正解' }}
              </span>
            </div>
            <p class="review-question-text">{{ question.text }}</p>
            <div class="review-choices">
              <div 
                v-for="(choice, cIndex) in question.choices" 
                :key="cIndex"
                :class="[
                  'review-choice',
                  { 
                    'user-selected': isChoiceSelected(question.id, choice.id),
                    'correct-answer': choice.isCorrect,
                    'wrong-answer': isChoiceSelected(question.id, choice.id) && !choice.isCorrect
                  }
                ]"
              >
                <div class="choice-label">{{ String.fromCharCode(65 + cIndex) }}</div>
                <div class="choice-text">{{ choice.text }}</div>
                <div class="choice-indicators">
                  <span v-if="choice.isCorrect" class="indicator correct-indicator">✓ 正解</span>
                  <span v-if="isChoiceSelected(question.id, choice.id)" class="indicator selected-indicator">あなたの回答</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- テスト受験中 -->
      <div v-else class="test-content">
        <!-- 進捗バー -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">
          問 {{ currentQuestionIndex + 1 }} / {{ testData.questions.length }}
        </div>

        <!-- 現在の問題 -->
        <div class="question-container" v-if="currentQuestion">
          <div class="question-header">
            <h2 class="question-number">問い {{ currentQuestionIndex + 1 }}</h2>
            <span class="question-type-badge">
              {{ currentQuestion.type === 'single' ? '単一選択' : '複数選択可' }}
            </span>
          </div>
          
          <p class="question-text">{{ currentQuestion.text }}</p>

          <div class="choices-container">
            <div 
              v-for="(choice, cIndex) in currentQuestion.choices" 
              :key="cIndex"
              :class="['choice-item', { selected: isChoiceSelected(currentQuestion.id, choice.id) }]"
              @click="selectChoice(currentQuestion.id, choice.id, currentQuestion.type)"
            >
              <div class="choice-indicator">
                <div v-if="currentQuestion.type === 'single'" class="radio-indicator">
                  <div v-if="isChoiceSelected(currentQuestion.id, choice.id)" class="radio-dot"></div>
                </div>
                <div v-else class="checkbox-indicator">
                  <svg v-if="isChoiceSelected(currentQuestion.id, choice.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div class="choice-label">{{ String.fromCharCode(65 + cIndex) }}</div>
              <div class="choice-text">{{ choice.text }}</div>
            </div>
          </div>

          <!-- ナビゲーションボタン -->
          <div class="navigation-buttons">
            <button 
              class="btn-prev" 
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              前の問題
            </button>
            
            <button 
              v-if="currentQuestionIndex < testData.questions.length - 1"
              class="btn-next" 
              @click="nextQuestion"
            >
              次の問題
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button 
              v-else
              class="btn-submit" 
              @click="submitTest"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '送信中...' : 'テストを提出' }}
            </button>
          </div>
        </div>
      </div>
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

const isLoading = ref(true)
const isSubmitting = ref(false)
const isCompleted = ref(false)
const showReview = ref(false)

const testData = ref<{
  id: number
  title: string
  videoId: number
  questions: Array<{
    id: number
    text: string
    type: 'single' | 'multiple'
    choices: Array<{
      id: number
      text: string
      isCorrect: boolean
    }>
  }>
} | null>(null)

const currentQuestionIndex = ref(0)
const answers = ref<Map<number, Set<number>>>(new Map())
const startTime = ref(Date.now())
const elapsedTime = ref(0)
const timerInterval = ref<NodeJS.Timeout | null>(null)

const score = ref(0)
const maxScore = ref(0)

// 現在の問題
const currentQuestion = computed(() => {
  if (!testData.value || currentQuestionIndex.value >= testData.value.questions.length) {
    return null
  }
  return testData.value.questions[currentQuestionIndex.value]
})

// 進捗率
const progress = computed(() => {
  if (!testData.value) return 0
  return ((currentQuestionIndex.value + 1) / testData.value.questions.length) * 100
})

// 得点率
const scorePercentage = computed(() => {
  if (maxScore.value === 0) return 0
  return Math.round((score.value / maxScore.value) * 100)
})

// 時間フォーマット
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// タイマー開始
const startTimer = () => {
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

// タイマー停止
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// テストデータを取得
const loadTestData = async () => {
  const testId = route.params.id
  if (!testId) {
    isLoading.value = false
    return
  }

  try {
    const data = await $fetch(`/api/tests/${testId}`, {
      method: 'GET'
    }) as any

    testData.value = {
      id: data.id,
      title: data.title,
      videoId: data.videoId,
      questions: data.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        choices: q.choices.map((c: any) => ({
          id: c.id,
          text: c.text,
          isCorrect: c.isCorrect
        }))
      }))
    }

    // 各問題の回答を初期化
    testData.value.questions.forEach(q => {
      answers.value.set(q.id, new Set())
    })

    console.log('[TestTake] Loaded test data:', testData.value)
  } catch (error) {
    console.error('Error loading test data:', error)
    alert('テストデータの読み込みに失敗しました')
  } finally {
    isLoading.value = false
  }
}

// 選択肢が選択されているか
const isChoiceSelected = (questionId: number, choiceId: number) => {
  const questionAnswers = answers.value.get(questionId)
  return questionAnswers ? questionAnswers.has(choiceId) : false
}

// 選択肢を選択
const selectChoice = (questionId: number, choiceId: number, type: 'single' | 'multiple') => {
  const questionAnswers = answers.value.get(questionId) || new Set()
  
  if (type === 'single') {
    // 単一選択: 他の選択を解除して新しい選択を設定
    questionAnswers.clear()
    questionAnswers.add(choiceId)
  } else {
    // 複数選択: トグル
    if (questionAnswers.has(choiceId)) {
      questionAnswers.delete(choiceId)
    } else {
      questionAnswers.add(choiceId)
    }
  }
  
  answers.value.set(questionId, questionAnswers)
}

// 次の問題へ
const nextQuestion = () => {
  if (testData.value && currentQuestionIndex.value < testData.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

// 前の問題へ
const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 問題が正解かどうか
const isQuestionCorrect = (question: any) => {
  const userAnswers = answers.value.get(question.id) || new Set()
  const correctAnswers = new Set(
    question.choices
      .filter((c: any) => c.isCorrect)
      .map((c: any) => c.id)
  )
  
  // 選択数が一致し、すべての選択が正解である
  if (userAnswers.size !== correctAnswers.size) return false
  
  for (const answerId of userAnswers) {
    if (!correctAnswers.has(answerId)) return false
  }
  
  return true
}

// テストを提出
const submitTest = async () => {
  if (!testData.value || !supabase) return

  // 未回答の問題をチェック
  const unansweredQuestions = testData.value.questions.filter(q => {
    const questionAnswers = answers.value.get(q.id)
    return !questionAnswers || questionAnswers.size === 0
  })

  if (unansweredQuestions.length > 0) {
    if (!confirm(`未回答の問題が${unansweredQuestions.length}問あります。このまま提出しますか？`)) {
      return
    }
  }

  if (!confirm('テストを提出してもよろしいですか？提出後は回答を変更できません。')) {
    return
  }

  try {
    isSubmitting.value = true
    stopTimer()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('ログインが必要です')
      router.push('/login')
      return
    }

    // 採点
    let correctCount = 0
    testData.value.questions.forEach(question => {
      if (isQuestionCorrect(question)) {
        correctCount++
      }
    })

    score.value = correctCount
    maxScore.value = testData.value.questions.length

    // 回答を送信
    const submissionData = {
      testId: testData.value.id,
      answers: Array.from(answers.value.entries()).map(([questionId, choiceIds]) => ({
        questionId,
        choiceIds: Array.from(choiceIds)
      })),
      score: score.value,
      maxScore: maxScore.value,
      elapsedTime: elapsedTime.value
    }

    await $fetch(`/api/tests/${testData.value.id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: submissionData
    })

    console.log('[TestTake] Test submitted successfully')
    isCompleted.value = true
  } catch (error: any) {
    console.error('Error submitting test:', error)
    alert('テストの提出に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
    startTimer() // エラー時はタイマーを再開
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await loadTestData()
  if (testData.value) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.test-take-page {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ヘッダー */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: #ffffff;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #9333ea;
}

.header-center {
  flex: 1;
  text-align: center;
}

.test-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f7ff;
  border-radius: 8px;
  color: #3b82f6;
  font-weight: 600;
  font-size: 16px;
}

/* メインコンテンツ */
.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
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
  padding: 12px 32px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #7e22ce;
}

/* 完了画面 */
.completion-state {
  max-width: 700px;
  margin: 0 auto;
}

.completion-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.completion-icon {
  margin-bottom: 24px;
}

.completion-icon svg {
  color: #10b981;
}

.completion-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.completion-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
}

.score-display {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.score-percentage {
  font-size: 24px;
  font-weight: 600;
}

.completion-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-review, .btn-home {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-review {
  background: #f0f7ff;
  color: #3b82f6;
}

.btn-review:hover {
  background: #dbeafe;
}

.btn-home {
  background: #9333ea;
  color: white;
}

.btn-home:hover {
  background: #7e22ce;
}

/* レビューセクション */
.review-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.review-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px 0;
}

.review-question {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.review-question:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.review-question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-question-number {
  font-size: 16px;
  font-weight: 700;
  color: #9333ea;
}

.review-result {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.review-result.correct {
  background: #d1fae5;
  color: #10b981;
}

.review-result.incorrect {
  background: #fee2e2;
  color: #ef4444;
}

.review-question-text {
  font-size: 16px;
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.review-choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-choice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
}

.review-choice.correct-answer {
  border-color: #10b981;
  background: #f0fdf4;
}

.review-choice.wrong-answer {
  border-color: #ef4444;
  background: #fef2f2;
}

.review-choice.user-selected.correct-answer {
  border-color: #10b981;
  background: #d1fae5;
}

.choice-indicators {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.indicator {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.correct-indicator {
  background: #d1fae5;
  color: #10b981;
}

.selected-indicator {
  background: #dbeafe;
  color: #3b82f6;
}

/* テスト受験中 */
.test-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea 0%, #7e22ce 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
}

.question-container {
  max-width: 800px;
  margin: 0 auto;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-number {
  font-size: 24px;
  font-weight: 700;
  color: #9333ea;
  margin: 0;
}

.question-type-badge {
  padding: 6px 16px;
  background: #f3e8ff;
  color: #9333ea;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.question-text {
  font-size: 18px;
  color: #333;
  line-height: 1.8;
  margin: 0 0 32px 0;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.choice-item:hover {
  border-color: #9333ea;
  background: #faf5ff;
}

.choice-item.selected {
  border-color: #9333ea;
  background: #f3e8ff;
}

.choice-indicator {
  flex-shrink: 0;
}

.radio-indicator {
  width: 24px;
  height: 24px;
  border: 2px solid #9333ea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 12px;
  height: 12px;
  background: #9333ea;
  border-radius: 50%;
}

.checkbox-indicator {
  width: 24px;
  height: 24px;
  border: 2px solid #9333ea;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.choice-item.selected .checkbox-indicator {
  background: #9333ea;
}

.choice-item.selected .checkbox-indicator svg {
  color: white;
}

.choice-label {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.choice-text {
  flex: 1;
  font-size: 16px;
  color: #333;
  line-height: 1.6;
}

/* ナビゲーションボタン */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.btn-prev, .btn-next, .btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-prev {
  background: #f5f5f5;
  color: #666;
}

.btn-prev:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-prev:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-next {
  background: #9333ea;
  color: white;
  margin-left: auto;
}

.btn-next:hover {
  background: #7e22ce;
}

.btn-submit {
  background: #10b981;
  color: white;
  margin-left: auto;
}

.btn-submit:hover:not(:disabled) {
  background: #059669;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>


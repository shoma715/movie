<template>
  <div class="test-create-page">
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
          <a href="#" class="nav-item active">
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
        <div class="test-create-content">
          <!-- ヘッダー -->
          <div class="page-header">
            <h1 class="page-title">テスト編集</h1>
            <div class="header-actions">
              <button class="btn-cancel" @click="handleCancel">キャンセル</button>
              <button class="btn-save" @click="handleSave" :disabled="isSaving">
                {{ isSaving ? '保存中...' : 'テストを保存' }}
              </button>
            </div>
          </div>

          <!-- テスト基本情報 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">テスト基本情報</h2>
            </div>
            <div class="form-content">
              <div class="form-group">
                <label class="form-label">タイトル <span class="required">*</span></label>
                <input 
                  v-model="testData.title" 
                  type="text" 
                  class="form-input" 
                  placeholder="例: 機械の操作系"
                />
              </div>
              <div class="form-group">
                <label class="form-label">紐付ける対象 <span class="required">*</span></label>
                <div class="radio-group" style="margin-bottom: 16px;">
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      name="link-type"
                      value="video"
                      v-model="linkType"
                      @change="onLinkTypeChange"
                    />
                    <span>動画</span>
                  </label>
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      name="link-type"
                      value="course"
                      v-model="linkType"
                      @change="onLinkTypeChange"
                    />
                    <span>コース</span>
                  </label>
                </div>
                <select 
                  v-if="linkType === 'video'"
                  v-model="testData.videoId" 
                  class="form-select"
                >
                  <option value="">動画を選択してください</option>
                  <option v-for="video in videos" :key="video.id" :value="video.id">
                    {{ video.title }}
                  </option>
                </select>
                <select 
                  v-else
                  v-model="testData.courseId" 
                  class="form-select"
                >
                  <option value="">コースを選択してください</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">紐付けるスキル（任意、複数選択可）</label>
                <div class="skills-selection-container">
                  <div 
                    v-for="(selectedSkill, index) in testData.selectedSkills" 
                    :key="`selected-${index}`"
                    class="skill-selection-row"
                  >
                    <select 
                      v-model="selectedSkill.skillId" 
                      class="form-select skill-select"
                      @change="onSkillSelectChange(index)"
                    >
                      <option value="">スキルを選択してください</option>
                      <option 
                        v-for="skill in availableSkills(index)" 
                        :key="skill.id" 
                        :value="skill.id"
                      >
                        {{ skill.name }}
                      </option>
                    </select>
                    <select 
                      v-if="selectedSkill.skillId"
                      v-model="selectedSkill.proficiencyLevel"
                      class="form-select proficiency-select"
                    >
                      <option value="triangle">△（初級）</option>
                      <option value="circle">○（中級）</option>
                      <option value="double_circle">◎（上級）</option>
                    </select>
                    <button 
                      v-if="testData.selectedSkills.length > 1"
                      class="remove-skill-btn" 
                      @click="removeSkillSelection(index)"
                      title="スキルを削除"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </button>
                  </div>
                  <button 
                    class="add-skill-selection-btn" 
                    @click="addSkillSelection"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    スキルを追加
                  </button>
                </div>
                <p class="hint-text">テスト合格時に習熟度を更新するスキルを選択できます。複数選択可能です。</p>
              </div>
            </div>
          </div>

          <!-- 問い一覧 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">問い一覧 (最大{{ testData.questions.length }}問)</h2>
              <button class="btn-add-question" @click="addQuestion">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                問いを追加
              </button>
            </div>

            <div v-if="testData.questions.length === 0" class="empty-questions">
              <p>問いがまだ追加されていません</p>
              <p class="empty-hint">「問いを追加」ボタンをクリックして問題を作成してください</p>
            </div>

            <div v-else class="questions-list">
              <div 
                v-for="(question, qIndex) in testData.questions" 
                :key="question.id" 
                class="question-card"
              >
                <div class="question-header">
                  <div class="question-number">問い {{ qIndex + 1 }}</div>
                  <button class="btn-remove-question" @click="removeQuestion(qIndex)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    削除
                  </button>
                </div>

                <div class="question-body">
                  <!-- 問い文 -->
                  <div class="form-group">
                    <label class="form-label">問い {{ qIndex + 1 }} <span class="required">*</span></label>
                    <textarea 
                      v-model="question.text" 
                      class="form-textarea" 
                      rows="3"
                      placeholder="問題文を入力してください"
                    ></textarea>
                  </div>

                  <!-- 回答形式 -->
                  <div class="form-group">
                    <label class="form-label">回答形式 <span class="required">*</span></label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          :name="`question-${qIndex}-type`"
                          value="single"
                          v-model="question.type"
                        />
                        <span>単一選択（1つだけ正解）</span>
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          :name="`question-${qIndex}-type`"
                          value="multiple"
                          v-model="question.type"
                        />
                        <span>複数選択（複数正解あり）</span>
                      </label>
                    </div>
                  </div>

                  <!-- 選択肢の数 -->
                  <div class="form-group">
                    <label class="form-label">選択肢の数 <span class="required">*</span></label>
                    <div class="choice-count-selector">
                      <button 
                        v-for="count in [2, 3, 4]" 
                        :key="count"
                        :class="['choice-count-btn', { active: question.choices.length === count }]"
                        @click="setChoiceCount(qIndex, count)"
                      >
                        {{ count }}択
                      </button>
                    </div>
                  </div>

                  <!-- 選択肢 -->
                  <div class="form-group">
                    <label class="form-label">選択肢 <span class="required">*</span></label>
                    <div class="choices-list">
                      <div 
                        v-for="(choice, cIndex) in question.choices" 
                        :key="cIndex"
                        class="choice-item"
                      >
                        <div class="choice-label">{{ String.fromCharCode(65 + cIndex) }}</div>
                        <input 
                          v-model="choice.text" 
                          type="text" 
                          class="choice-input" 
                          :placeholder="`選択肢${String.fromCharCode(65 + cIndex)}`"
                        />
                        <label class="checkbox-label">
                          <input 
                            type="checkbox" 
                            v-model="choice.isCorrect"
                            @change="handleCorrectChange(qIndex, cIndex)"
                          />
                          <span>正解</span>
                        </label>
                      </div>
                    </div>
                    <p v-if="question.type === 'single'" class="hint-text">
                      ※ 単一選択の場合、正解は1つだけ選択してください
                    </p>
                    <p v-else class="hint-text">
                      ※ 複数選択の場合、正解を複数選択できます
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 保存ボタン（下部） -->
          <div class="form-actions">
            <button class="btn-cancel-large" @click="handleCancel">キャンセル</button>
            <button class="btn-save-large" @click="handleSave" :disabled="isSaving">
              {{ isSaving ? '保存中...' : 'テストを保存' }}
            </button>
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

// 現在の組織
const currentOrganization = ref<string | null>(null)

const showUserMenu = ref(false)
const isSaving = ref(false)

// 動画リスト
const videos = ref<Array<{ id: number; title: string }>>([])

// コースリスト
const courses = ref<Array<{ id: number; name: string }>>([])

// 紐付けタイプ（'video' または 'course'）
const linkType = ref<'video' | 'course'>('video')

// スキルリスト
const skills = ref<Array<{
  id: number
  name: string
}>>([])

// テストデータ
const testData = ref({
  title: '',
  videoId: '',
  courseId: '',
  selectedSkills: [] as Array<{
    skillId: number | string
    proficiencyLevel: 'triangle' | 'circle' | 'double_circle'
  }>,
  questions: [] as Array<{
    id: number
    text: string
    type: 'single' | 'multiple'
    choices: Array<{
      text: string
      isCorrect: boolean
    }>
  }>
})

let questionIdCounter = 0

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
      
      // 組織管理者かどうかをチェック
      const userRole = user.user_metadata?.role || user.app_metadata?.role
      if (userRole !== 'org_admin' && userRole !== 'organization_admin') {
        alert('テストの作成・編集は組織管理者のみ可能です')
        router.push('/')
        return
      }
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('Error loading user:', error)
    router.push('/login')
  }
}

// 動画リストを取得
const loadVideos = async () => {
  try {
    const queryParams: any = {}
    
    // 現在の組織が設定されている場合、組織でフィルタリング
    if (currentOrganization.value) {
      queryParams.organization = currentOrganization.value
    }
    
    const data = await $fetch('/api/videos', {
      method: 'GET',
      query: queryParams
    })
    videos.value = (data || []).map((v: any) => ({
      id: v.id,
      title: v.title
    }))
  } catch (error) {
    console.error('Error loading videos:', error)
  }
}

// コースリストを取得
const loadCourses = async () => {
  try {
    const queryParams: any = {}
    
    // 現在の組織が設定されている場合、組織でフィルタリング
    if (currentOrganization.value) {
      queryParams.organization = currentOrganization.value
    }
    
    const data = await $fetch('/api/courses', {
      method: 'GET',
      query: queryParams
    })
    courses.value = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name
    }))
  } catch (error) {
    console.error('Error loading courses:', error)
  }
}

// スキルリストを取得
const loadSkills = async () => {
  try {
    if (!currentOrganization.value) return
    
    const data = await $fetch('/api/skills', {
      method: 'GET',
      query: {
        organization: currentOrganization.value
      }
    })
    skills.value = (data || []).map((s: any) => ({
      id: s.id,
      name: s.name
    }))
  } catch (error) {
    console.error('Error loading skills:', error)
    skills.value = []
  }
}

// 紐付けタイプが変更されたときの処理
const onLinkTypeChange = () => {
  // タイプが変更されたら、選択をリセット
  testData.value.videoId = ''
  testData.value.courseId = ''
}

// 利用可能なスキルを取得（既に選択されているスキルを除外）
const availableSkills = (currentIndex: number) => {
  const selectedIds = testData.value.selectedSkills
    .map((s, idx) => idx !== currentIndex ? s.skillId : null)
    .filter(id => id !== null && id !== '')
  return skills.value.filter(skill => !selectedIds.includes(skill.id))
}

// スキル選択が変更されたときの処理
const onSkillSelectChange = (index: number) => {
  const selectedSkill = testData.value.selectedSkills[index]
  if (selectedSkill && selectedSkill.skillId && !selectedSkill.proficiencyLevel) {
    // スキルが選択された場合、デフォルトの習熟度レベルを設定
    selectedSkill.proficiencyLevel = 'circle'
  }
}

// スキル選択を追加
const addSkillSelection = () => {
  testData.value.selectedSkills.push({
    skillId: '',
    proficiencyLevel: 'circle'
  })
}

// スキル選択を削除
const removeSkillSelection = (index: number) => {
  testData.value.selectedSkills.splice(index, 1)
}

// 問いを追加
const addQuestion = () => {
  testData.value.questions.push({
    id: questionIdCounter++,
    text: '',
    type: 'single',
    choices: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  })
}

// 問いを削除
const removeQuestion = (index: number) => {
  if (confirm('この問いを削除してもよろしいですか？')) {
    testData.value.questions.splice(index, 1)
  }
}

// 選択肢の数を変更
const setChoiceCount = (questionIndex: number, count: number) => {
  const question = testData.value.questions[questionIndex]
  if (!question) return
  const currentCount = question.choices.length
  
  if (count > currentCount) {
    // 選択肢を追加
    for (let i = currentCount; i < count; i++) {
      question.choices.push({ text: '', isCorrect: false })
    }
  } else if (count < currentCount) {
    // 選択肢を削除
    question.choices.splice(count)
  }
}

// 正解チェックボックスの変更処理
const handleCorrectChange = (questionIndex: number, choiceIndex: number) => {
  const question = testData.value.questions[questionIndex]
  if (!question) return
  
  // 単一選択の場合、他の選択肢のチェックを外す
  if (question.type === 'single') {
    question.choices.forEach((choice, index) => {
      if (index !== choiceIndex) {
        choice.isCorrect = false
      }
    })
  }
}

// 保存処理
const handleSave = async () => {
  // バリデーション
  if (!testData.value.title.trim()) {
    alert('タイトルを入力してください')
    return
  }
  
  if (linkType.value === 'video' && !testData.value.videoId) {
    alert('動画を選択してください')
    return
  }
  
  if (linkType.value === 'course' && !testData.value.courseId) {
    alert('コースを選択してください')
    return
  }
  
  // 選択されたスキルすべてに習熟度レベルが設定されているか確認
  for (const selectedSkill of testData.value.selectedSkills) {
    if (selectedSkill.skillId && !selectedSkill.proficiencyLevel) {
      alert('選択したスキルすべてに習熟度レベルを設定してください')
      return
    }
    if (!selectedSkill.skillId && selectedSkill.proficiencyLevel) {
      alert('スキルが選択されていない項目があります')
      return
    }
  }
  
  // 空のスキル選択を除外
  testData.value.selectedSkills = testData.value.selectedSkills.filter(s => s.skillId)
  
  if (testData.value.questions.length === 0) {
    alert('問いを少なくとも1つ追加してください')
    return
  }
  
  // 各問いのバリデーション
  for (let i = 0; i < testData.value.questions.length; i++) {
    const question = testData.value.questions[i]
    if (!question) {
      continue
    }
    
    if (!question.text.trim()) {
      alert(`問い${i + 1}の問題文を入力してください`)
      return
    }
    
    // 選択肢のチェック
    const emptyChoices = question.choices.filter(c => !c.text.trim())
    if (emptyChoices.length > 0) {
      alert(`問い${i + 1}の選択肢をすべて入力してください`)
      return
    }
    
    // 正解のチェック
    const correctChoices = question.choices.filter(c => c.isCorrect)
    if (correctChoices.length === 0) {
      alert(`問い${i + 1}の正解を少なくとも1つ選択してください`)
      return
    }
    
    if (question.type === 'single' && correctChoices.length > 1) {
      alert(`問い${i + 1}は単一選択です。正解は1つだけ選択してください`)
      return
    }
  }
  
  try {
    isSaving.value = true
    
    if (!supabase) {
      alert('Supabase接続が利用できません')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('ログインが必要です')
      router.push('/login')
      return
    }

    // APIにテストデータを保存
    const response = await $fetch('/api/tests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: {
        title: testData.value.title,
        videoId: linkType.value === 'video' ? testData.value.videoId : null,
        courseId: linkType.value === 'course' ? testData.value.courseId : null,
        skills: testData.value.selectedSkills
          .filter(s => s.skillId)
          .map(s => ({
            skillId: s.skillId,
            proficiencyLevelOnPass: s.proficiencyLevel
          })),
        questions: testData.value.questions.map(q => ({
          text: q.text,
          type: q.type,
          choices: q.choices.map(c => ({
            text: c.text,
            isCorrect: c.isCorrect
          }))
        }))
      }
    })
    
    console.log('[TestCreate] Test saved successfully:', response)
    alert('テストを保存しました')
    
    // テスト一覧ページに戻る
    router.push('/tests')
  } catch (error: any) {
    console.error('Error saving test:', error)
    console.error('Error details:', error.data)
    
    // エラーメッセージを取得
    let errorMessage = '不明なエラー'
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    } else if (error.statusMessage) {
      errorMessage = error.statusMessage
    }
    
    alert('テストの保存に失敗しました: ' + errorMessage)
  } finally {
    isSaving.value = false
  }
}

// キャンセル処理
const handleCancel = () => {
  if (confirm('編集内容を破棄してもよろしいですか？')) {
    router.push('/')
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
  await loadCurrentUser()
  await loadVideos()
  await loadCourses()
  await loadSkills()
  // 初期状態で1つのスキル選択行を追加
  if (testData.value.selectedSkills.length === 0) {
    addSkillSelection()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.test-create-page {
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

.test-create-content {
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

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-save {
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

.btn-save {
  background: #3b82f6;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* フォームセクション */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
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

.btn-add-question {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-question:hover {
  background: #7e22ce;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.required {
  color: #ef4444;
}

.form-input, .form-select, .form-textarea {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #9333ea;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 空の問い一覧 */
.empty-questions {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-questions p {
  margin: 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px;
  margin-top: 8px !important;
}

/* 問いカード */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e0e0e0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.question-number {
  font-size: 18px;
  font-weight: 700;
  color: #9333ea;
}

.btn-remove-question {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-remove-question:hover {
  background: #fecaca;
}

.question-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ラジオグループ */
.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 選択肢数セレクター */
.choice-count-selector {
  display: flex;
  gap: 12px;
}

.choice-count-btn {
  padding: 10px 24px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.choice-count-btn:hover {
  border-color: #9333ea;
  color: #9333ea;
}

.choice-count-btn.active {
  border-color: #9333ea;
  background: #9333ea;
  color: white;
}

/* 選択肢リスト */
.choices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.choice-label {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.choice-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.choice-input:focus {
  outline: none;
  border-color: #9333ea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  white-space: nowrap;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.hint-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* スキル選択コンテナ */
.skills-selection-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-selection-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-select {
  flex: 1;
}

.proficiency-select {
  min-width: 180px;
}

.remove-skill-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  color: #dc2626;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-skill-btn:hover {
  background: #fee2e2;
  border-color: #dc2626;
}

.add-skill-selection-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px dashed #9333ea;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #9333ea;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.add-skill-selection-btn:hover {
  background: #f3e8ff;
  border-color: #7e22ce;
  color: #7e22ce;
}

.add-skill-selection-btn svg {
  flex-shrink: 0;
}

/* フォームアクション */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 32px 0;
}

.btn-cancel-large, .btn-save-large {
  padding: 14px 48px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-large {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel-large:hover {
  background: #e0e0e0;
}

.btn-save-large {
  background: #3b82f6;
  color: white;
}

.btn-save-large:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save-large:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>


<template>
  <div class="skill-map-page">
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
            <NuxtLink to="/courses" class="nav-item">
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
          <div class="nav-item-wrapper">
            <NuxtLink to="/skill-map" class="nav-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <span>スキルマップ</span>
            </NuxtLink>
            <HelpTooltip
              title="スキルマップ"
              text="動画マニュアルとスキル項目を紐づけて習熟度を可視化します。"
              :features="[
                'スキル項目の管理',
                '動画とスキルの紐づけ',
                '習熟度の可視化'
              ]"
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
              <span>設定</span>
            </a>
            <HelpTooltip
              text="アプリケーションの各種設定を変更できます。"
              placement="right"
            />
          </div>
        </nav>
      </aside>

      <!-- メインコンテンツ -->
      <main class="content-area">
        <div class="skill-map-content">
          <div class="page-header">
            <h1 class="page-title">{{ organizationName || 'スキルマップ' }}</h1>
            <button class="tutorial-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-8 10 8M2 10v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6"/>
                <path d="M6 14h12"/>
              </svg>
              チュートリアル
            </button>
          </div>

          <!-- スキルマップテーブル -->
          <div class="skill-map-table-container">
            <table class="skill-map-table">
              <thead>
                <tr>
                  <th class="skill-column">スキル</th>
                  <th 
                    v-for="user in displayedUsers" 
                    :key="user.id"
                    class="user-column"
                  >
                    {{ user.displayName }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td :colspan="displayedUsers.length + 1" class="loading-cell">
                    読み込み中...
                  </td>
                </tr>
                <template v-else>
                  <!-- スキルが0件で管理者でない場合 -->
                  <tr v-if="skills.length === 0 && !isOrgAdmin">
                    <td :colspan="displayedUsers.length + 1" class="empty-cell">
                      スキルがまだ登録されていません
                    </td>
                  </tr>
                  <!-- デフォルト：スキル追加行（一番上、スキルが0件の場合のみ） -->
                  <tr v-if="skills.length === 0 && isOrgAdmin" class="add-skill-row">
                    <td class="skill-cell">
                      <button class="add-skill-btn" @click="showAddSkillModal = true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="16"/>
                          <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                        <span>スキルを追加</span>
                      </button>
                    </td>
                    <td 
                      v-for="user in displayedUsers" 
                      :key="`add-empty-${user.id}`"
                      class="proficiency-cell"
                    >
                    </td>
                  </tr>
                  <!-- スキル一覧（スキルが1件以上ある場合） -->
                  <template v-if="skills.length > 0">
                    <tr v-for="skill in skills" :key="skill.id" class="skill-row">
                      <td class="skill-cell">
                        <div class="skill-name-wrapper">
                          <div v-if="isOrgAdmin" class="skill-actions">
                            <button 
                              class="skill-action-btn remove-btn" 
                              @click="deleteSkill(skill.id)"
                              title="スキルを削除"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                              </svg>
                            </button>
                          </div>
                          <span class="skill-name">{{ skill.name }}</span>
                        </div>
                      </td>
                      <td 
                        v-for="user in displayedUsers" 
                        :key="`${skill.id}-${user.id}`"
                        class="proficiency-cell"
                      >
                        <span class="proficiency-symbol" :class="getProficiencyClass(getProficiencyLevel(skill.id, user.id))">
                          {{ getProficiencySymbol(getProficiencyLevel(skill.id, user.id)) }}
                        </span>
                      </td>
                    </tr>
                    <!-- スキル追加行（管理者のみ、スキル一覧の下に表示） -->
                    <tr v-if="isOrgAdmin" class="add-skill-row">
                      <td class="skill-cell">
                        <button class="add-skill-btn" @click="showAddSkillModal = true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                          </svg>
                          <span>スキルを追加</span>
                        </button>
                      </td>
                      <td 
                        v-for="user in displayedUsers" 
                        :key="`add-${user.id}`"
                        class="proficiency-cell"
                      >
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>

          <!-- スキル追加モーダル -->
          <div v-if="showAddSkillModal" class="modal-overlay" @click="showAddSkillModal = false">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h2>スキルを追加</h2>
                <button class="close-btn" @click="showAddSkillModal = false">×</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label">スキル名 <span class="required">*</span></label>
                  <input 
                    v-model="newSkillName" 
                    type="text" 
                    class="form-input" 
                    placeholder="例: 月次負荷計画立案"
                    @keyup.enter="addSkill"
                  />
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-cancel" @click="showAddSkillModal = false">キャンセル</button>
                <button class="btn-confirm" @click="addSkill" :disabled="!newSkillName.trim() || isAddingSkill">
                  {{ isAddingSkill ? '追加中...' : '追加' }}
                </button>
              </div>
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
  id?: string
  email?: string
  displayName?: string
  user_metadata?: any
} | null>(null)

// 現在の組織
const currentOrganization = ref<string | null>(null)
const organizationName = ref<string>('')

// ユーザーメニューの表示状態
const showUserMenu = ref(false)

// 組織管理者かどうか
const isOrgAdmin = ref(false)

// スキル一覧
const skills = ref<Array<{
  id: number
  name: string
  organization: string
}>>([])

// 習熟度データ
const proficiencies = ref<Array<{
  skillId: number
  skillName: string
  userProficiencies: Array<{
    userId: string
    displayName: string
    proficiencyLevel: string
  }>
}>>([])

// 組織内のユーザー一覧
const organizationUsers = ref<Array<{
  id: string
  displayName: string
}>>([])

// 表示するユーザー（管理者は全員、一般ユーザーは自分のみ）
const displayedUsers = computed(() => {
  if (isOrgAdmin.value) {
    return organizationUsers.value
  } else {
    return organizationUsers.value.filter(u => u.id === currentUser.value?.id)
  }
})

// ローディング状態
const isLoading = ref(false)
const isAddingSkill = ref(false)

// モーダル
const showAddSkillModal = ref(false)
const newSkillName = ref('')

// アバターの初期文字を取得
const getAvatarInitial = (name: string | undefined) => {
  if (!name) return '?'
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
}

// 動画編集画面に遷移
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

// ユーザー情報を取得
const loadCurrentUser = async () => {
  if (!supabase) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      currentUser.value = {
        id: user.id,
        email: user.email || '',
        displayName: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || '',
        user_metadata: user.user_metadata
      }
      
      // 組織情報を取得
      if (user.user_metadata?.organization) {
        currentOrganization.value = user.user_metadata.organization
        organizationName.value = user.user_metadata.organization
      }
      
      // 組織管理者かどうかをチェック
      const userRole = user.user_metadata?.role || user.app_metadata?.role
      isOrgAdmin.value = userRole === 'org_admin' || userRole === 'organization_admin'
    }
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

// スキル一覧を取得
const loadSkills = async () => {
  if (!currentOrganization.value || !supabase) return

  try {
    isLoading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const skillsData = await $fetch('/api/skills', {
      method: 'GET',
      query: {
        organization: currentOrganization.value
      }
    })

    skills.value = skillsData || []
  } catch (error) {
    console.error('Error loading skills:', error)
    skills.value = []
  } finally {
    isLoading.value = false
  }
}

// 習熟度とユーザー一覧を取得
const loadProficiencies = async () => {
  if (!currentOrganization.value || !supabase) return

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const proficienciesData = await $fetch('/api/skills/proficiencies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      query: {
        organization: currentOrganization.value
      }
    })

    proficiencies.value = (proficienciesData || []) as Array<{
      skillId: number
      skillName: string
      userProficiencies: Array<{
        userId: string
        displayName: string
        proficiencyLevel: string
      }>
    }>

    // ユーザー一覧を取得（組織内の全ユーザー）
    const usersData = await $fetch('/api/users', {
      method: 'GET',
      query: {
        organization: currentOrganization.value
      }
    })

    organizationUsers.value = (usersData || []).map((u: any) => ({
      id: u.id || u.uuid,
      displayName: u.displayName || u.user_metadata?.display_name || u.email?.split('@')[0] || 'Unknown'
    }))
  } catch (error) {
    console.error('Error loading proficiencies:', error)
    proficiencies.value = []
    organizationUsers.value = []
  }
}

// 習熟度レベルを取得
const getProficiencyLevel = (skillId: number, userId: string): string => {
  const skillData = proficiencies.value.find(p => p.skillId === skillId)
  if (!skillData) return 'none'
  
  const userProf = skillData.userProficiencies.find(up => up.userId === userId)
  const level = userProf?.proficiencyLevel || 'none'
  
  // デバッグ用ログ（double_circleの場合のみ）
  if (level === 'double_circle') {
    console.log('[SkillMap] Found double_circle:', {
      skillId,
      userId,
      skillData,
      userProf,
      level
    })
  }
  
  return level
}

// 習熟度シンボルを取得
const getProficiencySymbol = (level: string): string => {
  switch (level) {
    case 'double_circle':
      return '◎'
    case 'circle':
      return '○'
    case 'triangle':
      return '△'
    case 'none':
    default:
      return '×'
  }
}

// 習熟度クラスを取得
const getProficiencyClass = (level: string): string => {
  switch (level) {
    case 'double_circle':
      return 'double-circle'
    case 'circle':
      return 'circle'
    case 'triangle':
      return 'triangle'
    case 'none':
    default:
      return 'none'
  }
}

// スキルを追加
const addSkill = async () => {
  if (!newSkillName.value.trim() || !currentOrganization.value || !supabase) {
    alert('スキル名を入力してください')
    return
  }

  try {
    isAddingSkill.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('ログインが必要です')
      return
    }

    await $fetch('/api/skills', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: {
        name: newSkillName.value.trim(),
        organization: currentOrganization.value
      }
    })

    newSkillName.value = ''
    showAddSkillModal.value = false
    await loadSkills()
    await loadProficiencies()
    alert('スキルを追加しました')
  } catch (error: any) {
    console.error('Error adding skill:', error)
    alert('スキルの追加に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  } finally {
    isAddingSkill.value = false
  }
}

// スキルを削除
const deleteSkill = async (skillId: number) => {
  if (!confirm('このスキルを削除してもよろしいですか？')) {
    return
  }

  if (!supabase) {
    alert('Supabase接続が利用できません')
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('ログインが必要です')
      return
    }

    await $fetch(`/api/skills/${skillId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    await loadSkills()
    await loadProficiencies()
    alert('スキルを削除しました')
  } catch (error: any) {
    console.error('Error deleting skill:', error)
    alert('スキルの削除に失敗しました: ' + (error.data?.message || error.message || '不明なエラー'))
  }
}

// コンポーネントマウント時にデータを取得
onMounted(async () => {
  await loadCurrentUser()
  if (currentOrganization.value) {
    await loadSkills()
    await loadProficiencies()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.skill-map-page {
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

.skill-map-content {
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

/* スキルマップテーブル */
.skill-map-table-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
}

.skill-map-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.skill-map-table thead {
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.skill-map-table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}

.skill-column {
  min-width: 300px;
  position: sticky;
  left: 0;
  background: #f9fafb;
  z-index: 5;
}

.user-column {
  min-width: 120px;
  text-align: center;
}

.skill-map-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.skill-map-table tbody tr:hover {
  background: #f9fafb;
}

.skill-cell {
  padding: 16px;
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}

.skill-row:hover .skill-cell {
  background: #f9fafb;
}

.skill-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-name {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.skill-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.skill-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn {
  background: #dbeafe;
  color: #3b82f6;
}

.add-btn:hover {
  background: #bfdbfe;
}

.remove-btn {
  background: #fee2e2;
  color: #dc2626;
}

.remove-btn:hover {
  background: #fecaca;
}

.proficiency-cell {
  padding: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.proficiency-symbol {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 50%;
  text-align: center;
}

.proficiency-symbol.none {
  color: #999;
}

.proficiency-symbol.triangle {
  color: #f59e0b;
}

.proficiency-symbol.circle {
  color: #3b82f6;
}

.proficiency-symbol.double-circle {
  color: #10b981;
}


.loading-cell,
.empty-cell {
  padding: 40px;
  text-align: center;
  color: #999;
}

.empty-hint {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.add-skill-row {
  border-top: 2px dashed #e0e0e0;
}

.add-skill-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px dashed #9333ea;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #9333ea;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.add-skill-btn:hover {
  background: #f3e8ff;
  border-color: #7e22ce;
  color: #7e22ce;
}

.add-skill-btn svg {
  flex-shrink: 0;
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
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  font-weight: 700;
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

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #9333ea;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
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
</style>


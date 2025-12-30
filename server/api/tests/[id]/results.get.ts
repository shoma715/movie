export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      throw createError({
        statusCode: 500,
        message: 'Supabase設定が不完全です'
      })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 認証チェック
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: '認証に失敗しました'
      })
    }

    // 組織管理者かどうかをチェック
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    const userOrganization = user.user_metadata?.organization || ''
    
    console.log('[API/Tests/Results] User role:', userRole)
    console.log('[API/Tests/Results] User organization:', userOrganization)
    
    if (userRole !== 'org_admin' && userRole !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        message: 'テスト結果の閲覧は組織管理者のみ可能です'
      })
    }

    // テストIDを取得（URLパラメータ）
    const testIdParam = parseInt(event.context.params?.id || '0')
    console.log('[API/Tests/Results] ID from URL:', testIdParam)
    
    if (!testIdParam) {
      throw createError({
        statusCode: 400,
        message: '無効なテストIDです'
      })
    }

    // テストIDでテスト情報を取得
    console.log('[API/Tests/Results] Fetching test for ID:', testIdParam)
    console.log('[API/Tests/Results] User organization:', userOrganization)
    
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testIdParam)
      .eq('organization', userOrganization)
      .single()
    
    console.log('[API/Tests/Results] Test data:', test)
    console.log('[API/Tests/Results] Test error:', testError)

    if (testError || !test) {
      console.error('[API/Tests/Results] Test not found. Error:', testError)
      throw createError({
        statusCode: 404,
        message: 'テストが見つかりません'
      })
    }

    // 動画情報を取得（video_idがある場合）
    let video = null
    let videoId = test.video_id
    if (test.video_id) {
      const { data: videoData } = await supabaseAdmin
        .from('videos')
        .select('title')
        .eq('id', test.video_id)
        .single()
      video = videoData
      console.log('[API/Tests/Results] Video data:', video)
    }

    // コース情報を取得（course_idがある場合）
    let course = null
    if (test.course_id) {
      const { data: courseData } = await supabaseAdmin
        .from('courses')
        .select('name')
        .eq('id', test.course_id)
        .single()
      course = courseData
      console.log('[API/Tests/Results] Course data:', course)
    }

    // テストが組織に属しているか確認
    if (test.organization !== userOrganization) {
      console.error('[API/Tests/Results] Organization mismatch. Test org:', test.organization, 'User org:', userOrganization)
      throw createError({
        statusCode: 403,
        message: 'このテストにアクセスする権限がありません'
      })
    }

    // 組織のユーザーを取得
    console.log('[API/Tests/Results] Fetching organization users for:', userOrganization)
    
    const { data: orgUsers } = await supabaseAdmin.auth.admin.listUsers()
    const organizationUserIds = (orgUsers?.users || [])
      .filter(u => u.user_metadata?.organization === userOrganization)
      .map(u => u.id)
    
    console.log('[API/Tests/Results] Organization user IDs count:', organizationUserIds.length)
    console.log('[API/Tests/Results] Organization user IDs:', organizationUserIds)

    // 受験履歴を取得
    console.log('[API/Tests/Results] Fetching attempts for test ID:', test.id)
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .eq('test_id', test.id)
      .eq('is_completed', true)
      .in('user_id', organizationUserIds)
      .order('completed_at', { ascending: false })
    
    console.log('[API/Tests/Results] Attempts found:', attempts?.length || 0)
    console.log('[API/Tests/Results] Attempts error:', attemptsError)

    if (attemptsError) {
      console.error('[API/Tests/[id]/Results.GET] Error fetching attempts:', attemptsError)
      throw createError({
        statusCode: 500,
        message: 'テスト結果の取得に失敗しました'
      })
    }

    // 動画視聴履歴を取得（動画IDがある場合のみ）
    let userWatchCompleted = new Map<string, string>()
    if (videoId) {
      console.log('[API/Tests/Results] Fetching watch history for video ID:', videoId)
      const { data: watchHistory, error: watchHistoryError } = await supabaseAdmin
        .from('video_watch_history')
        .select('user_id, completed_at')
        .eq('video_id', videoId)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .in('user_id', organizationUserIds)
        .order('completed_at', { ascending: false })
      
      console.log('[API/Tests/Results] Watch history found:', watchHistory?.length || 0)
      console.log('[API/Tests/Results] Watch history error:', watchHistoryError)
      
      // ユーザーごとの動画視聴完了日時をマップ
      watchHistory?.forEach(history => {
        if (history.completed_at && (!userWatchCompleted.has(history.user_id) || 
            new Date(history.completed_at) > new Date(userWatchCompleted.get(history.user_id) || ''))) {
          userWatchCompleted.set(history.user_id, history.completed_at)
        }
      })
      
      console.log('[API/Tests/Results] Watch history mapped for', userWatchCompleted.size, 'users')
    } else {
      console.log('[API/Tests/Results] No video ID, skipping watch history')
    }

    // ユーザーごとに集計
    const userResults = new Map<string, {
      userId: string
      userName: string
      email: string
      attemptCount: number
      maxScore: number
      averageScore: number
      lastAttemptDate: string
      firstAttemptDate: string
      totalTime: number
      videoCompletedAt: string | null
      attempts: Array<{
        attemptId: number
        score: number
        maxScore: number
        completedAt: string
        elapsedTime: number
      }>
    }>()

    for (const attempt of attempts || []) {
      const userId = attempt.user_id
      
      // ユーザー情報を取得
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      const userName = userData?.user?.user_metadata?.display_name || 
                      userData?.user?.user_metadata?.username || 
                      userData?.user?.email?.split('@')[0] || 
                      '不明なユーザー'
      const email = userData?.user?.email || ''

      // 経過時間を計算
      const startTime = new Date(attempt.started_at).getTime()
      const endTime = new Date(attempt.completed_at).getTime()
      const elapsedTime = Math.floor((endTime - startTime) / 1000)

      if (!userResults.has(userId)) {
        userResults.set(userId, {
          userId,
          userName,
          email,
          attemptCount: 0,
          maxScore: 0,
          averageScore: 0,
          lastAttemptDate: attempt.completed_at,
          firstAttemptDate: attempt.completed_at,
          totalTime: 0,
          videoCompletedAt: userWatchCompleted.get(userId) || null,
          attempts: []
        })
      }

      const userResult = userResults.get(userId)!
      userResult.attemptCount++
      userResult.maxScore = Math.max(userResult.maxScore, attempt.score || 0)
      userResult.totalTime += elapsedTime
      userResult.attempts.push({
        attemptId: attempt.id,
        score: attempt.score || 0,
        maxScore: attempt.max_score || 0,
        completedAt: attempt.completed_at,
        elapsedTime
      })

      // 最初と最後の受験日を更新
      if (new Date(attempt.completed_at) > new Date(userResult.lastAttemptDate)) {
        userResult.lastAttemptDate = attempt.completed_at
      }
      if (new Date(attempt.completed_at) < new Date(userResult.firstAttemptDate)) {
        userResult.firstAttemptDate = attempt.completed_at
      }
    }

    // 平均点を計算
    userResults.forEach(result => {
      const totalScore = result.attempts.reduce((sum, a) => sum + a.score, 0)
      result.averageScore = result.attemptCount > 0 ? totalScore / result.attemptCount : 0
    })

    // 統計情報を計算
    const allAttempts = Array.from(userResults.values()).flatMap(r => r.attempts)
    const totalAttempts = allAttempts.length
    const averageScore = totalAttempts > 0 
      ? allAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts 
      : 0
    const maxPossibleScore = allAttempts.length > 0 ? allAttempts[0].maxScore : 0
    const passRate = totalAttempts > 0
      ? (allAttempts.filter(a => (a.score / a.maxScore) >= 0.6).length / totalAttempts) * 100
      : 0

    const results = Array.from(userResults.values()).map(r => ({
      userId: r.userId,
      userName: r.userName,
      email: r.email,
      attemptCount: r.attemptCount,
      maxScore: r.maxScore,
      averageScore: Math.round(r.averageScore * 10) / 10,
      lastAttemptDate: r.lastAttemptDate,
      firstAttemptDate: r.firstAttemptDate,
      averageTime: r.attemptCount > 0 ? Math.floor(r.totalTime / r.attemptCount) : 0,
      videoCompletedAt: r.videoCompletedAt,
      attempts: r.attempts
    }))

    console.log('[API/Tests/[id]/Results.GET] Returning results for test:', test.id)

    return {
      test: {
        id: test.id,
        title: test.title,
        videoTitle: video?.title || null,
        videoId: test.video_id,
        courseTitle: course?.name || null,
        courseId: test.course_id
      },
      statistics: {
        totalUsers: results.length,
        totalAttempts,
        averageScore: Math.round(averageScore * 10) / 10,
        maxPossibleScore,
        passRate: Math.round(passRate * 10) / 10
      },
      results
    }
  } catch (error: any) {
    console.error('Error in test results GET API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テスト結果の取得に失敗しました'
    })
  }
})


export default defineEventHandler(async (event) => {
  try {
    const videoId = parseInt(getRouterParam(event, 'id') || '0')
    if (!videoId) {
      throw createError({
        statusCode: 400,
        message: '動画IDが指定されていません'
      })
    }

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

    // リクエストヘッダーから認証トークンを取得
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // トークンからユーザー情報を取得
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: '認証に失敗しました'
      })
    }

    // 組織管理者かどうかを確認
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    if (userRole !== 'org_admin') {
      throw createError({
        statusCode: 403,
        message: '組織管理者のみアクセスできます'
      })
    }

    // 組織情報を取得
    const organization = user.user_metadata?.organization
    if (!organization) {
      throw createError({
        statusCode: 400,
        message: '組織情報が取得できませんでした'
      })
    }

    // 同じ組織のユーザーを取得
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      throw createError({
        statusCode: 500,
        message: 'ユーザー一覧の取得に失敗しました'
      })
    }

    // 同じ組織のユーザーIDを取得
    const organizationUserIds = (users || [])
      .filter((u) => {
        const userOrg = u.user_metadata?.organization || '自組織 (ID: 2)'
        return userOrg === organization
      })
      .map((u) => u.id)

    // 視聴履歴を取得（完了したもののみ）
    const { data: watchHistory, error: historyError } = await supabaseAdmin
      .from('video_watch_history')
      .select('*')
      .eq('video_id', videoId)
      .eq('is_completed', true)
      .in('user_id', organizationUserIds)
      .order('completed_at', { ascending: false })

    if (historyError) {
      console.error('[API/Results] Error fetching watch history:', historyError)
      throw createError({
        statusCode: 500,
        message: '視聴履歴の取得に失敗しました'
      })
    }

    // ユーザー情報と視聴履歴を結合
    const results = (watchHistory || []).map((history) => {
      const user = users?.find((u) => u.id === history.user_id)
      return {
        userId: history.user_id,
        userName: user?.user_metadata?.display_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unknown',
        email: user?.email || '',
        startedAt: history.started_at,
        completedAt: history.completed_at
      }
    })

    return results
  } catch (error: any) {
    console.error('Error in results API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '受験結果の取得に失敗しました'
    })
  }
})





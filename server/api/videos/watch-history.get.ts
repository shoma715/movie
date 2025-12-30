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

    // ユーザーの視聴履歴を取得
    const { data: watchHistory, error: historyError } = await supabaseAdmin
      .from('video_watch_history')
      .select('*')
      .eq('user_id', user.id)

    if (historyError) {
      console.error('[API/WatchHistory] Error fetching watch history:', historyError)
      throw createError({
        statusCode: 500,
        message: '視聴履歴の取得に失敗しました'
      })
    }

    return watchHistory || []
  } catch (error: any) {
    console.error('Error in watch history API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '視聴履歴の取得に失敗しました'
    })
  }
})











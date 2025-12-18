export default defineEventHandler(async (event) => {
  try {
    const videoId = parseInt(getRouterParam(event, 'id') || '0')
    if (!videoId) {
      throw createError({
        statusCode: 400,
        message: '動画IDが指定されていません'
      })
    }

    const body = await readBody(event)
    const { isCompleted } = body

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

    // 視聴履歴を更新または作成
    const now = new Date().toISOString()
    
    if (isCompleted) {
      // 完了時はcompleted_atを設定
      const { data, error } = await supabaseAdmin
        .from('video_watch_history')
        .upsert({
          video_id: videoId,
          user_id: user.id,
          is_completed: true,
          completed_at: now,
          started_at: now // 既存レコードの場合は更新されない
        }, {
          onConflict: 'video_id,user_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('[API/WatchHistory] Error updating watch history:', error)
        throw createError({
          statusCode: 500,
          message: '視聴履歴の更新に失敗しました'
        })
      }

      return data
    } else {
      // 開始時はstarted_atを設定（既に存在する場合は更新しない）
      const { data, error } = await supabaseAdmin
        .from('video_watch_history')
        .upsert({
          video_id: videoId,
          user_id: user.id,
          started_at: now
        }, {
          onConflict: 'video_id,user_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('[API/WatchHistory] Error creating watch history:', error)
        throw createError({
          statusCode: 500,
          message: '視聴履歴の作成に失敗しました'
        })
      }

      return data
    }
  } catch (error: any) {
    console.error('Error in watch history API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '視聴履歴の処理に失敗しました'
    })
  }
})






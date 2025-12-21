export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.user_id as string

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'ユーザーIDは必須です'
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

    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('id, title, draft_data, created_at')
      .eq('user_id', userId)
      .eq('is_draft', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API/Videos/Drafts] Error fetching drafts:', error)
      throw createError({
        statusCode: 500,
        message: `下書きの取得に失敗しました: ${error.message}`
      })
    }

    return data || []
  } catch (error: any) {
    console.error('Error in drafts fetch API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '下書きの取得に失敗しました'
    })
  }
})


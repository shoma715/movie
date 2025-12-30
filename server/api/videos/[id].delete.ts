export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    console.log('[API/Videos] DELETE video request received:', { id })

    if (!id) {
      throw createError({
        statusCode: 400,
        message: '動画IDは必須です'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      throw createError({
        statusCode: 500,
        message: 'Supabase設定が不完全です。'
      })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 動画を削除
    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('[API/Videos] Error deleting video:', error)
      
      throw createError({
        statusCode: 500,
        message: `動画の削除に失敗しました: ${error.message || 'Unknown error'}`
      })
    }

    console.log('[API/Videos] Video deleted successfully')

    return { success: true }
  } catch (error: any) {
    console.error('[API/Videos] Error in video deletion API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '動画の削除に失敗しました'
    })
  }
})



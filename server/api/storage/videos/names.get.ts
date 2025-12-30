export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      console.error('[StorageVideoNames] Missing Supabase configuration:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
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

    // すべての動画ファイル名マッピングを取得
    const { data, error } = await supabaseAdmin
      .from('storage_video_files')
      .select('*')

    if (error) {
      console.error('[StorageVideoNames] Error fetching mappings:', error)
      throw createError({
        statusCode: 500,
        message: `動画名マッピングの取得に失敗しました: ${error.message || 'Unknown error'}`
      })
    }

    console.log('[StorageVideoNames] Returning mappings count:', data?.length || 0)
    return data || []
  } catch (error: any) {
    console.error('[StorageVideoNames] Error in names.get API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '動画名マッピングの取得に失敗しました'
    })
  }
})




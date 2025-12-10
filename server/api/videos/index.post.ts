export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { title, video_url, thumbnail_url, category_id, user_id } = body

    if (!title || !video_url) {
      throw createError({
        statusCode: 400,
        message: 'タイトルと動画URLは必須です'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    console.log('API Config check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlLength: supabaseUrl?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0
    })

    if (!supabaseServiceKey || !supabaseUrl) {
      console.error('Supabase configuration missing:', {
        url: supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
      throw createError({
        statusCode: 500,
        message: 'Supabase設定が不完全です。環境変数SUPABASE_URLとSUPABASE_SERVICE_KEYを確認してください。'
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
      .insert({
        title,
        video_url,
        thumbnail_url: thumbnail_url || null,
        category_id: category_id || null,
        user_id: user_id || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating video:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // テーブルが存在しない場合のエラーメッセージ
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        throw createError({
          statusCode: 500,
          message: 'videosテーブルが存在しません。Supabaseでテーブルを作成してください。'
        })
      }
      
      // RLSポリシーのエラー
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        throw createError({
          statusCode: 500,
          message: 'Row Level Security (RLS)ポリシーが設定されていません。'
        })
      }
      
      throw createError({
        statusCode: 500,
        message: error.message || '動画の作成に失敗しました'
      })
    }

    return data
  } catch (error: any) {
    console.error('Error in video creation API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '動画の作成に失敗しました'
    })
  }
})


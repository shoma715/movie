export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { title, draft_data, video_id, user_id } = body

    if (!title || !draft_data || !user_id) {
      throw createError({
        statusCode: 400,
        message: 'タイトル、下書きデータ、ユーザーIDは必須です'
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

    // 既存の下書きを更新するか、新規作成するか
    if (video_id) {
      // 既存の下書きを更新
      const { data, error } = await supabaseAdmin
        .from('videos')
        .update({
          title,
          draft_data,
          is_draft: true
        })
        .eq('id', video_id)
        .eq('user_id', user_id)
        .select()
        .single()

      if (error) {
        console.error('[API/Videos/Draft] Error updating draft:', error)
        throw createError({
          statusCode: 500,
          message: `下書きの更新に失敗しました: ${error.message}`
        })
      }

      return data
    } else {
      // 新規下書きを作成
      const { data, error } = await supabaseAdmin
        .from('videos')
        .insert({
          title,
          draft_data,
          is_draft: true,
          video_url: '', // 下書きなので空
          user_id: user_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('[API/Videos/Draft] Error creating draft:', error)
        throw createError({
          statusCode: 500,
          message: `下書きの作成に失敗しました: ${error.message}`
        })
      }

      return data
    }
  } catch (error: any) {
    console.error('Error in draft save API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '下書きの保存に失敗しました'
    })
  }
})


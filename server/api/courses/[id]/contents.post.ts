export default defineEventHandler(async (event) => {
  try {
    const courseId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { video_id, order_index } = body

    console.log('[API/Courses] POST content request received:', {
      courseId,
      videoId: video_id,
      orderIndex: order_index
    })

    if (!courseId || !video_id) {
      throw createError({
        statusCode: 400,
        message: 'コースIDと動画IDは必須です'
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

    // 既存のコンテンツを確認（重複チェック）
    const { data: existing } = await supabaseAdmin
      .from('course_contents')
      .select('id')
      .eq('course_id', courseId)
      .eq('video_id', video_id)
      .single()

    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'この動画は既にコースに追加されています'
      })
    }

    // order_indexが指定されていない場合、最大値を取得して+1
    let finalOrderIndex = order_index
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      const { data: maxOrder } = await supabaseAdmin
        .from('course_contents')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      finalOrderIndex = maxOrder ? (maxOrder.order_index + 1) : 0
    }

    const { data, error } = await supabaseAdmin
      .from('course_contents')
      .insert({
        course_id: parseInt(courseId),
        video_id: parseInt(video_id),
        order_index: finalOrderIndex,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[API/Courses] Error adding content:', error)
      
      throw createError({
        statusCode: 500,
        message: `動画の追加に失敗しました: ${error.message || 'Unknown error'}`
      })
    }

    console.log('[API/Courses] Content added successfully:', data?.id)

    return data
  } catch (error: any) {
    console.error('[API/Courses] Error in content addition API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '動画の追加に失敗しました'
    })
  }
})


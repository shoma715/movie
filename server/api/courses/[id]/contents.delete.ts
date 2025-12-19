export default defineEventHandler(async (event) => {
  try {
    const courseId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const contentId = query.contentId as string
    const videoId = query.videoId as string

    console.log('[API/Courses] DELETE content request received:', {
      courseId,
      contentId,
      videoId
    })

    if (!courseId) {
      throw createError({
        statusCode: 400,
        message: 'コースIDは必須です'
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

    // contentIdが指定されている場合はそれを使用、そうでない場合はvideoIdとcourseIdで削除
    let deleteQuery = supabaseAdmin
      .from('course_contents')
      .delete()
      .eq('course_id', parseInt(courseId))

    if (contentId) {
      deleteQuery = deleteQuery.eq('id', parseInt(contentId))
    } else if (videoId) {
      deleteQuery = deleteQuery.eq('video_id', parseInt(videoId))
    } else {
      throw createError({
        statusCode: 400,
        message: 'コンテンツIDまたは動画IDは必須です'
      })
    }

    const { error } = await deleteQuery

    if (error) {
      console.error('[API/Courses] Error deleting content:', error)
      
      throw createError({
        statusCode: 500,
        message: `動画の削除に失敗しました: ${error.message || 'Unknown error'}`
      })
    }

    console.log('[API/Courses] Content deleted successfully')

    return { success: true }
  } catch (error: any) {
    console.error('[API/Courses] Error in content deletion API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '動画の削除に失敗しました'
    })
  }
})


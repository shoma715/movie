export default defineEventHandler(async (event) => {
  try {
    const courseId = getRouterParam(event, 'id')

    console.log('[API/Courses] DELETE course request received:', { courseId })

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

    // コースを削除（CASCADEでcourse_contentsも自動削除される）
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', parseInt(courseId))

    if (error) {
      console.error('[API/Courses] Error deleting course:', error)
      
      throw createError({
        statusCode: 500,
        message: `コースの削除に失敗しました: ${error.message || 'Unknown error'}`
      })
    }

    console.log('[API/Courses] Course deleted successfully')

    return { success: true }
  } catch (error: any) {
    console.error('[API/Courses] Error in course deletion API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'コースの削除に失敗しました'
    })
  }
})











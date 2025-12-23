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

    // 認証チェック
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: '認証に失敗しました'
      })
    }

    // 組織管理者かどうかをチェック
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    if (userRole !== 'org_admin' && userRole !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        message: 'テストの削除は組織管理者のみ可能です'
      })
    }

    // テストIDを取得
    const testId = parseInt(event.context.params?.id || '0')
    if (!testId) {
      throw createError({
        statusCode: 400,
        message: '無効なテストIDです'
      })
    }

    // テストを削除（カスケード削除で問題・選択肢も削除される）
    const { error: deleteError } = await supabaseAdmin
      .from('tests')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      console.error('[API/Tests/[id].DELETE] Error deleting test:', deleteError)
      throw createError({
        statusCode: 500,
        message: 'テストの削除に失敗しました'
      })
    }

    console.log('[API/Tests/[id].DELETE] Test deleted successfully:', testId)

    return {
      success: true,
      message: 'テストを削除しました'
    }
  } catch (error: any) {
    console.error('Error in test DELETE API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの削除に失敗しました'
    })
  }
})







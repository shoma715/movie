export default defineEventHandler(async (event) => {
  try {
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      })
    }

    const token = authHeader.replace('Bearer ', '')
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

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: '認証に失敗しました'
      })
    }

    const userRole = user.user_metadata?.role || user.app_metadata?.role
    if (userRole !== 'org_admin' && userRole !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        message: 'スキルの削除は組織管理者のみ可能です'
      })
    }

    const skillId = getRouterParam(event, 'id')
    if (!skillId) {
      throw createError({
        statusCode: 400,
        message: 'スキルIDが指定されていません'
      })
    }

    // スキルが存在し、ユーザーの組織のものか確認
    const { data: skill, error: fetchError } = await supabaseAdmin
      .from('skills')
      .select('organization')
      .eq('id', skillId)
      .single()

    if (fetchError || !skill) {
      throw createError({
        statusCode: 404,
        message: 'スキルが見つかりません'
      })
    }

    const userOrganization = user.user_metadata?.organization
    if (skill.organization !== userOrganization) {
      throw createError({
        statusCode: 403,
        message: '自分の組織のスキルのみ削除できます'
      })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('skills')
      .delete()
      .eq('id', skillId)

    if (deleteError) {
      console.error('Error deleting skill:', deleteError)
      throw createError({
        statusCode: 500,
        message: 'スキルの削除に失敗しました'
      })
    }

    return {
      success: true,
      message: 'スキルを削除しました'
    }
  } catch (error: any) {
    console.error('Error in skills DELETE API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'スキルの削除に失敗しました'
    })
  }
})



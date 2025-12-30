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
        message: 'スキルの作成は組織管理者のみ可能です'
      })
    }

    const body = await readBody(event)
    const { name, organization } = body

    if (!name || !organization) {
      throw createError({
        statusCode: 400,
        message: 'スキル名と組織名は必須です'
      })
    }

    // ユーザーの組織と一致するか確認
    const userOrganization = user.user_metadata?.organization
    if (userOrganization !== organization) {
      throw createError({
        statusCode: 403,
        message: '自分の組織のスキルのみ作成できます'
      })
    }

    const { data: skill, error } = await supabaseAdmin
      .from('skills')
      .insert({
        name: name.trim(),
        organization: organization
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating skill:', error)
      if (error.code === '23505') { // Unique violation
        throw createError({
          statusCode: 400,
          message: 'このスキル名は既に存在します'
        })
      }
      throw createError({
        statusCode: 500,
        message: 'スキルの作成に失敗しました'
      })
    }

    return {
      success: true,
      skill,
      message: 'スキルを作成しました'
    }
  } catch (error: any) {
    console.error('Error in skills POST API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'スキルの作成に失敗しました'
    })
  }
})



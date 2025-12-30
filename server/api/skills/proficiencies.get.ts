export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const organization = query.organization as string | undefined
    const skillId = query.skillId as string | undefined

    if (!organization) {
      throw createError({
        statusCode: 400,
        message: '組織名が指定されていません'
      })
    }

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
    const isOrgAdmin = userRole === 'org_admin' || userRole === 'organization_admin'

    // スキル一覧を取得
    let skillsQuery = supabaseAdmin
      .from('skills')
      .select('*')
      .eq('organization', organization)
      .order('created_at', { ascending: true })

    if (skillId) {
      skillsQuery = skillsQuery.eq('id', skillId)
    }

    const { data: skills, error: skillsError } = await skillsQuery

    if (skillsError) {
      console.error('Error fetching skills:', skillsError)
      throw createError({
        statusCode: 500,
        message: 'スキルの取得に失敗しました'
      })
    }

    if (!skills || skills.length === 0) {
      return []
    }

    // 組織内のユーザー一覧を取得
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw createError({
        statusCode: 500,
        message: 'ユーザー一覧の取得に失敗しました'
      })
    }

    const organizationUsers = (users || []).filter(u => 
      u.user_metadata?.organization === organization
    )

    // 習熟度を取得
    const skillIds = skills.map(s => s.id)
    const { data: proficiencies, error: profError } = await supabaseAdmin
      .from('skill_proficiencies')
      .select('*')
      .in('skill_id', skillIds)

    if (profError) {
      console.error('Error fetching proficiencies:', profError)
      throw createError({
        statusCode: 500,
        message: '習熟度の取得に失敗しました'
      })
    }

    // デバッグ用ログ（double_circleを含む習熟度を確認）
    const doubleCircleProfs = (proficiencies || []).filter(p => p.proficiency_level === 'double_circle')
    if (doubleCircleProfs.length > 0) {
      console.log('[API/Skills/Proficiencies.GET] Found double_circle proficiencies:', doubleCircleProfs)
    }
    console.log('[API/Skills/Proficiencies.GET] All proficiencies:', JSON.stringify(proficiencies, null, 2))

    // 結果を整形
    const result = skills.map(skill => {
      const skillProficiencies = (proficiencies || []).filter(p => p.skill_id === skill.id)
      
      const userProficiencies = organizationUsers.map(orgUser => {
        const proficiency = skillProficiencies.find(p => p.user_id === orgUser.id)
        const level = proficiency?.proficiency_level || 'none'
        
        // デバッグ用ログ（double_circleの場合のみ）
        if (level === 'double_circle') {
          console.log('[API/Skills/Proficiencies.GET] Found double_circle for user:', {
            skillId: skill.id,
            skillName: skill.name,
            userId: orgUser.id,
            proficiency: proficiency,
            level: level
          })
        }
        
        return {
          userId: orgUser.id,
          displayName: orgUser.user_metadata?.display_name || orgUser.user_metadata?.username || orgUser.email?.split('@')[0] || 'Unknown',
          proficiencyLevel: level
        }
      })

      return {
        skillId: skill.id,
        skillName: skill.name,
        userProficiencies: isOrgAdmin 
          ? userProficiencies  // 管理者は全員分
          : userProficiencies.filter(up => up.userId === user.id)  // 一般ユーザーは自分のみ
      }
    })

    return result
  } catch (error: any) {
    console.error('Error in skills proficiencies GET API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '習熟度の取得に失敗しました'
    })
  }
})


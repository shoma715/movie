export default defineEventHandler(async (event) => {
  try {
    // クエリパラメータから組織名を取得
    const query = getQuery(event)
    const organization = query.organization as string | undefined

    console.log('[API/Categories] Requested organization:', organization)

    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      return []
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 組織が指定されている場合、その組織のユーザーIDを取得
    let organizationUserIds: string[] = []
    if (organization) {
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('[API/Categories] Error fetching users:', usersError)
      } else {
        // 指定された組織のユーザーIDを取得
        organizationUserIds = (users || [])
          .filter((user) => {
            const userOrganization = user.user_metadata?.organization || '自組織 (ID: 2)'
            return userOrganization === organization
          })
          .map((user) => user.id)
        
        console.log(`[API/Categories] Found ${organizationUserIds.length} users in organization "${organization}"`)
      }
    }

    // カテゴリを取得
    let queryBuilder = supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    // 組織でフィルタリング
    if (organization) {
      queryBuilder = queryBuilder.eq('organization', organization)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    console.log(`[API/Categories] Returning ${data?.length || 0} categories`)
    return data || []
  } catch (error: any) {
    console.error('Error in categories API:', error)
    return []
  }
})


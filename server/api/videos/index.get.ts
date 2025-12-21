export default defineEventHandler(async (event) => {
  try {
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

    // クエリパラメータからカテゴリIDと組織名を取得
    const query = getQuery(event)
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : null
    const organization = query.organization as string | undefined

    console.log('[API/Videos] Request params:', { categoryId, organization })

    // 組織が指定されている場合、その組織のユーザーIDを取得
    let organizationUserIds: string[] = []
    if (organization) {
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('[API/Videos] Error fetching users:', usersError)
      } else {
        // 指定された組織のユーザーIDを取得
        organizationUserIds = (users || [])
          .filter((user) => {
            const userOrganization = user.user_metadata?.organization || '自組織 (ID: 2)'
            return userOrganization === organization
          })
          .map((user) => user.id)
        
        console.log(`[API/Videos] Found ${organizationUserIds.length} users in organization "${organization}"`)
      }
    }

    // Supabaseのテーブルから動画を取得
    let queryBuilder = supabaseAdmin
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    // 下書きを除外（is_draftがtrueでないものを取得）
    queryBuilder = queryBuilder.neq('is_draft', true)

    // 組織でフィルタリング
    if (organization && organizationUserIds.length > 0) {
      queryBuilder = queryBuilder.in('user_id', organizationUserIds)
    } else if (organization && organizationUserIds.length === 0) {
      // 組織が指定されているが、その組織にユーザーがいない場合は空配列を返す
      return []
    }

    // カテゴリでフィルタリング
    if (categoryId !== null) {
      queryBuilder = queryBuilder.eq('category_id', categoryId)
    } else if (categoryId === null && query.categoryId === 'uncategorized') {
      // 未分類の動画を取得（category_idがnull）
      queryBuilder = queryBuilder.is('category_id', null)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Error fetching videos:', error)
      return []
    }

    console.log(`[API/Videos] Returning ${data?.length || 0} videos`)
    return data || []
  } catch (error: any) {
    console.error('Error in videos API:', error)
    return []
  }
})


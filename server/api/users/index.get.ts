export default defineEventHandler(async (event) => {
  try {
    // クエリパラメータから組織名を取得
    const query = getQuery(event)
    const organization = query.organization as string | undefined

    console.log('[API/Users] Requested organization:', organization)

    // 組織名が指定されていない場合はエラー
    if (!organization) {
      throw createError({
        statusCode: 400,
        message: '組織名が指定されていません'
      })
    }

    // Supabase Admin Clientを作成
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      // 環境変数が設定されていない場合は空の配列を返す
      console.warn('Supabase service key or URL not configured. Returning empty user list.')
      return []
    }

    // 動的インポートを使用してサーバーサイドのみで読み込む
    const { createClient } = await import('@supabase/supabase-js')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // ユーザー一覧を取得
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      throw createError({
        statusCode: 500,
        message: 'ユーザー一覧の取得に失敗しました'
      })
    }

    // ユーザー情報を整形し、指定された組織のユーザーのみをフィルタリング
    console.log('[API/Users] Total users fetched:', users?.length || 0)
    
    const formattedUsers = (users || [])
      .map((user) => {
        const userOrganization = user.user_metadata?.organization || '自組織 (ID: 2)'
        return {
          user,
          userOrganization,
          matches: userOrganization === organization
        }
      })
      .filter((item) => {
        if (!item.matches) {
          console.log(`[API/Users] Filtered out user ${item.user.email}: organization "${item.userOrganization}" !== "${organization}"`)
        }
        return item.matches
      })
      .map((item) => ({
        id: item.user.id,
        uuid: item.user.id,
        email: item.user.email || '',
        displayName: item.user.user_metadata?.display_name || item.user.user_metadata?.username || item.user.email?.split('@')[0] || 'Unknown',
        organization: item.user.user_metadata?.organization || '自組織 (ID: 2)',
        role: item.user.user_metadata?.role || 'user',
        active: item.user.email_confirmed_at !== null,
        email_confirmed_at: item.user.email_confirmed_at,
        user_metadata: item.user.user_metadata
      }))

    console.log('[API/Users] Filtered users count:', formattedUsers.length)
    return formattedUsers
  } catch (error: any) {
    console.error('Error in user list API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'ユーザー一覧の取得に失敗しました'
    })
  }
})

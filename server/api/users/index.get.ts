export default defineEventHandler(async (event) => {
  try {
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

    // ユーザー情報を整形
    const formattedUsers = (users || []).map((user) => ({
      id: user.id,
      uuid: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Unknown',
      organization: user.user_metadata?.organization || '自組織 (ID: 2)',
      role: user.user_metadata?.role || 'user',
      active: user.email_confirmed_at !== null,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata
    }))

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

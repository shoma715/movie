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

    // 認証チェック（オプショナル - 未ログインでも閲覧可能にする場合）
    const authHeader = getRequestHeader(event, 'authorization')
    let userOrganization = ''

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

      if (user) {
        userOrganization = user.user_metadata?.organization || ''
      }
    }

    // クエリパラメータを取得
    const query = getQuery(event)
    const organization = query.organization as string || userOrganization
    const videoId = query.videoId as string

    // テスト一覧を取得
    let testsQuery = supabaseAdmin
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false })

    if (organization) {
      testsQuery = testsQuery.eq('organization', organization)
    }

    if (videoId) {
      testsQuery = testsQuery.eq('video_id', parseInt(videoId))
    }

    const { data: tests, error: testsError } = await testsQuery

    if (testsError) {
      console.error('[API/Tests.GET] Error fetching tests:', testsError)
      throw createError({
        statusCode: 500,
        message: 'テストの取得に失敗しました'
      })
    }

    // 各テストの問題数を取得
    const testsWithDetails = await Promise.all(
      (tests || []).map(async (test) => {
        // 問題数を取得
        const { count, error: countError } = await supabaseAdmin
          .from('test_questions')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', test.id)

        // 動画情報を取得
        const { data: video, error: videoError } = await supabaseAdmin
          .from('videos')
          .select('title')
          .eq('id', test.video_id)
          .single()

        return {
          id: test.id,
          title: test.title,
          videoId: test.video_id,
          videoTitle: video?.title || '不明な動画',
          questionCount: count || 0,
          organization: test.organization,
          createdAt: test.created_at,
          updatedAt: test.updated_at
        }
      })
    )

    console.log('[API/Tests.GET] Returning tests:', testsWithDetails.length)

    return testsWithDetails
  } catch (error: any) {
    console.error('Error in tests GET API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの取得に失敗しました'
    })
  }
})




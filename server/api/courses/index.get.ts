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

    // クエリパラメータから組織名を取得
    const query = getQuery(event)
    const organization = query.organization as string | undefined

    console.log('[API/Courses] Request params:', { organization })

    // 組織が指定されている場合、その組織のユーザーIDを取得
    let organizationUserIds: string[] = []
    if (organization) {
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('[API/Courses] Error fetching users:', usersError)
      } else {
        // 指定された組織のユーザーIDを取得
        organizationUserIds = (users || [])
          .filter((user) => {
            const userOrganization = user.user_metadata?.organization || '自組織 (ID: 2)'
            return userOrganization === organization
          })
          .map((user) => user.id)
        
        console.log(`[API/Courses] Found ${organizationUserIds.length} users in organization "${organization}"`)
      }
    }

    // コースを取得（組織でフィルタリング）
    let queryBuilder = supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    // 組織でフィルタリング
    if (organization) {
      // 組織IDを取得（組織名から組織IDを取得する必要がある場合）
      // ここでは、organizationが組織IDとして扱われると仮定
      queryBuilder = queryBuilder.eq('organization_id', organization)
    }

    const { data: courses, error: coursesError } = await queryBuilder

    if (coursesError) {
      console.error('[API/Courses] Error fetching courses:', coursesError)
      return []
    }

    if (!courses || courses.length === 0) {
      return []
    }

    // 各コースのコンテンツ（動画）と視聴進捗を取得
    const coursesWithProgress = await Promise.all(
      courses.map(async (course: any) => {
        // コースのコンテンツ（動画）を取得
        const { data: contents, error: contentsError } = await supabaseAdmin
          .from('course_contents')
          .select(`
            id,
            order_index,
            video:videos (
              id,
              title,
              video_url,
              thumbnail_url,
              created_at
            )
          `)
          .eq('course_id', course.id)
          .order('order_index', { ascending: true })

        if (contentsError) {
          console.error(`[API/Courses] Error fetching contents for course ${course.id}:`, contentsError)
          return {
            ...course,
            contents: [],
            progress: { completed: 0, total: 0, percentage: 0 }
          }
        }

        const videos = (contents || [])
          .map((content: any) => content.video)
          .filter((video: any) => video !== null)

        // 視聴進捗を計算（組織内の全ユーザーの視聴履歴を集計）
        let completedCount = 0
        if (organizationUserIds.length > 0 && videos.length > 0) {
          const videoIds = videos.map((v: any) => v.id)
          const { data: watchHistory, error: historyError } = await supabaseAdmin
            .from('video_watch_history')
            .select('video_id, is_completed')
            .in('video_id', videoIds)
            .in('user_id', organizationUserIds)
            .eq('is_completed', true)

          if (!historyError && watchHistory) {
            // ユニークな動画IDの数をカウント（同じ動画を複数ユーザーが視聴しても1つとしてカウント）
            const completedVideoIds = new Set(watchHistory.map((h: any) => h.video_id))
            completedCount = completedVideoIds.size
          }
        }

        const total = videos.length
        const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0

        return {
          ...course,
          contents: videos,
          progress: {
            completed: completedCount,
            total: total,
            percentage: percentage
          }
        }
      })
    )

    console.log(`[API/Courses] Returning ${coursesWithProgress.length} courses`)
    return coursesWithProgress
  } catch (error: any) {
    console.error('[API/Courses] Error:', error)
    return []
  }
})





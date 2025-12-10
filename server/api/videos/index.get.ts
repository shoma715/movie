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

    // クエリパラメータからカテゴリIDを取得
    const query = getQuery(event)
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : null

    // Supabaseのテーブルから動画を取得
    let queryBuilder = supabaseAdmin
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

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

    return data || []
  } catch (error: any) {
    console.error('Error in videos API:', error)
    return []
  }
})


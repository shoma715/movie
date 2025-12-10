export default defineEventHandler(async (event) => {
  try {
    // クエリパラメータから組織名を取得
    const query = getQuery(event)
    const organization = query.organization as string | undefined

    console.log('[API/Tags] Requested organization:', organization)

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

    // タグを取得
    let queryBuilder = supabaseAdmin
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

    // 組織でフィルタリング
    if (organization) {
      queryBuilder = queryBuilder.eq('organization', organization)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }

    console.log(`[API/Tags] Returning ${data?.length || 0} tags`)
    return data || []
  } catch (error: any) {
    console.error('Error in tags API:', error)
    return []
  }
})


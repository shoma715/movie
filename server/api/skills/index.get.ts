export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const organization = query.organization as string | undefined

    if (!organization) {
      throw createError({
        statusCode: 400,
        message: '組織名が指定されていません'
      })
    }

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

    const { data: skills, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('organization', organization)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching skills:', error)
      throw createError({
        statusCode: 500,
        message: 'スキルの取得に失敗しました'
      })
    }

    return skills || []
  } catch (error: any) {
    console.error('Error in skills GET API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'スキルの取得に失敗しました'
    })
  }
})



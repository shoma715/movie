export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description, organization_id } = body

    console.log('[API/Courses] POST request received:', {
      hasName: !!name,
      hasOrganizationId: !!organization_id
    })

    if (!name) {
      throw createError({
        statusCode: 400,
        message: 'コース名は必須です'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      throw createError({
        statusCode: 500,
        message: 'Supabase設定が不完全です。'
      })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        name,
        description: description || null,
        organization_id: organization_id || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[API/Courses] Error creating course:', error)
      
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        throw createError({
          statusCode: 500,
          message: 'coursesテーブルが存在しません。Supabaseでテーブルを作成してください。'
        })
      }
      
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        throw createError({
          statusCode: 500,
          message: 'Row Level Security (RLS)ポリシーが設定されていません。'
        })
      }
      
      throw createError({
        statusCode: 500,
        message: `コースの作成に失敗しました: ${error.message || 'Unknown error'}`
      })
    }

    console.log('[API/Courses] Course created successfully:', data?.id)

    return data
  } catch (error: any) {
    console.error('[API/Courses] Error in course creation API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'コースの作成に失敗しました'
    })
  }
})


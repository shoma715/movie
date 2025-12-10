export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description } = body

    if (!name) {
      throw createError({
        statusCode: 400,
        message: 'カテゴリ名は必須です'
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

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        description: description || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      throw createError({
        statusCode: 500,
        message: error.message || 'カテゴリの作成に失敗しました'
      })
    }

    return data
  } catch (error: any) {
    console.error('Error in category creation API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'カテゴリの作成に失敗しました'
    })
  }
})


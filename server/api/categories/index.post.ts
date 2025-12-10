export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description, organization } = body

    if (!name) {
      throw createError({
        statusCode: 400,
        message: 'カテゴリ名は必須です'
      })
    }

    if (!organization) {
      throw createError({
        statusCode: 400,
        message: '組織名は必須です'
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

    console.log('[API/Categories] Creating category:', { name, organization })
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        description: description || null,
        organization: organization,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // カラムが存在しない場合のエラーメッセージ
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        throw createError({
          statusCode: 500,
          message: 'categoriesテーブルにorganizationカラムが存在しません。Supabaseでorganizationカラムを追加してください。'
        })
      }
      
      // RLSポリシーのエラー
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        throw createError({
          statusCode: 500,
          message: 'Row Level Security (RLS)ポリシーが設定されていません。'
        })
      }
      
      throw createError({
        statusCode: 500,
        message: `カテゴリの作成に失敗しました: ${error.message || 'Unknown error'}${error.details ? ` (${error.details})` : ''}`
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


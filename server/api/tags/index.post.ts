export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, organization } = body

    console.log('Tag creation request received:', { name, organization })

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        message: 'タグ名は必須です'
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

    console.log('Supabase config check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
    })

    if (!supabaseServiceKey || !supabaseUrl) {
      console.error('Supabase configuration missing')
      throw createError({
        statusCode: 500,
        message: 'Supabase設定が不完全です。環境変数SUPABASE_URLとSUPABASE_SERVICE_KEYを確認してください。'
      })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 既に存在するタグかチェック（同じ組織内で）
    const { data: existingTags, error: checkError } = await supabaseAdmin
      .from('tags')
      .select('id')
      .eq('name', name.trim())
      .eq('organization', organization)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing tags:', checkError)
      throw createError({
        statusCode: 500,
        message: `タグの確認中にエラーが発生しました: ${checkError.message}`
      })
    }

    if (existingTags && existingTags.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'このタグは既に存在します'
      })
    }

    const trimmedName = name.trim()
    console.log('Attempting to create tag:', trimmedName)

    const { data, error } = await supabaseAdmin
      .from('tags')
      .insert({
        name: trimmedName,
        organization: organization
        // created_atはデータベースのデフォルト値を使用
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // テーブルが存在しない場合のエラーメッセージ
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        throw createError({
          statusCode: 500,
          message: 'tagsテーブルが存在しません。Supabaseでテーブルを作成してください。'
        })
      }
      
      // RLSポリシーのエラー
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        throw createError({
          statusCode: 500,
          message: 'Row Level Security (RLS)ポリシーが設定されていません。'
        })
      }
      
      // UNIQUE制約違反
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        throw createError({
          statusCode: 400,
          message: 'このタグは既に存在します'
        })
      }
      
      throw createError({
        statusCode: 500,
        message: `タグの作成に失敗しました: ${error.message || 'Unknown error'}${error.details ? ` (${error.details})` : ''}`
      })
    }

    console.log('Tag created successfully:', data)
    return data
  } catch (error: any) {
    console.error('Error in tag creation API:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    })
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'タグの作成に失敗しました'
    })
  }
})


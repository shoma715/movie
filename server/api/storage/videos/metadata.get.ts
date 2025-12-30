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

    // クエリパラメータからファイル名を取得
    const query = getQuery(event)
    const fileName = query.fileName as string

    if (!fileName) {
      throw createError({
        statusCode: 400,
        message: 'ファイル名が指定されていません'
      })
    }

    // Storageからファイル情報を取得
    // 注意: Supabase Storageのlist()ではカスタムメタデータが取得できないため、
    // ここではファイルの存在確認のみを行います
    // 実際のメタデータは、アップロード時に設定したものがStorageに保存されていますが、
    // JavaScriptクライアントからは直接取得できません
    
    // ファイルの存在確認
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('videos')
      .list('', {
        limit: 1000,
        search: fileName
      })

    if (listError) {
      throw createError({
        statusCode: 500,
        message: 'ファイル情報の取得に失敗しました'
      })
    }

    const file = files?.find(f => f.name === fileName)
    
    if (!file) {
      throw createError({
        statusCode: 404,
        message: 'ファイルが見つかりません'
      })
    }

    // ファイル情報を返す
    // 注意: カスタムメタデータ（userIdなど）は、list()では取得できないため、
    // ここでは標準メタデータのみを返します
    return {
      name: file.name,
      id: file.id,
      created_at: file.created_at,
      updated_at: file.updated_at,
      last_accessed_at: file.last_accessed_at,
      metadata: file.metadata || {}
    }
  } catch (error: any) {
    console.error('Error in storage metadata API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'ファイル情報の取得に失敗しました'
    })
  }
})




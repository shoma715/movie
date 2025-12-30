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

    const body = await readBody(event)
    const { storageName, originalName, userId, organization } = body || {}

    if (!storageName || !originalName) {
      throw createError({
        statusCode: 400,
        message: 'storageNameとoriginalNameは必須です'
      })
    }

    console.log('[StorageVideoNames] Upserting name mapping:', {
      storageName,
      originalName,
      userId,
      organization
    })

    // まず既存のレコードを確認（完全一致）
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('storage_video_files')
      .select('*')
      .eq('storage_name', storageName)
      .single()

    let result
    if (existingData && !checkError) {
      // 既存のレコードがある場合は更新
      console.log('[StorageVideoNames] Updating existing record:', existingData.id)
      const { data, error } = await supabaseAdmin
        .from('storage_video_files')
        .update({
          original_name: originalName,
          user_id: userId || null,
          organization: organization || null
        })
        .eq('storage_name', storageName)
        .select()
        .single()

      if (error) {
        console.error('[StorageVideoNames] Error updating mapping:', error)
        throw createError({
          statusCode: 500,
          message: `動画名マッピングの更新に失敗しました: ${error.message || 'Unknown error'}`
        })
      }
      result = data
    } else {
      // 完全一致が見つからない場合、UUIDプレフィックスで既存レコードを検索
      const uuidMatch = storageName.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
      if (uuidMatch && uuidMatch[1]) {
        const uuid = uuidMatch[1]
        // UUIDのみがstorage_nameとして保存されているレコードを検索
        const { data: uuidData, error: uuidError } = await supabaseAdmin
          .from('storage_video_files')
          .select('*')
          .eq('storage_name', uuid)
          .single()
        
        if (uuidData && !uuidError) {
          // UUIDのみのレコードが見つかった場合、storage_nameを実際のファイル名に更新
          console.log('[StorageVideoNames] Updating UUID-only record to full filename:', uuidData.id, uuid, '->', storageName)
          const { data, error } = await supabaseAdmin
            .from('storage_video_files')
            .update({
              storage_name: storageName, // 実際の完全なファイル名に更新
              original_name: originalName,
              user_id: userId || null,
              organization: organization || null
            })
            .eq('storage_name', uuid)
            .select()
            .single()

          if (error) {
            console.error('[StorageVideoNames] Error updating UUID record:', error)
            throw createError({
              statusCode: 500,
              message: `動画名マッピングの更新に失敗しました: ${error.message || 'Unknown error'}`
            })
          }
          result = data
        } else {
          // UUIDレコードも見つからない場合、新規作成
          console.log('[StorageVideoNames] Inserting new record (UUID not found)')
          const { data, error } = await supabaseAdmin
            .from('storage_video_files')
            .insert({
              storage_name: storageName,
              original_name: originalName,
              user_id: userId || null,
              organization: organization || null
            })
            .select()
            .single()

          if (error) {
            console.error('[StorageVideoNames] Error inserting mapping:', error)
            throw createError({
              statusCode: 500,
              message: `動画名マッピングの保存に失敗しました: ${error.message || 'Unknown error'}`
            })
          }
          result = data
        }
      } else {
        // UUIDマッチがない場合、新規作成
        console.log('[StorageVideoNames] Inserting new record (no UUID match)')
        const { data, error } = await supabaseAdmin
          .from('storage_video_files')
          .insert({
            storage_name: storageName,
            original_name: originalName,
            user_id: userId || null,
            organization: organization || null
          })
          .select()
          .single()

        if (error) {
          console.error('[StorageVideoNames] Error inserting mapping:', error)
          throw createError({
            statusCode: 500,
            message: `動画名マッピングの保存に失敗しました: ${error.message || 'Unknown error'}`
          })
        }
        result = data
      }
    }

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('[StorageVideoNames] Error in names.post API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '動画名マッピングの保存に失敗しました'
    })
  }
})



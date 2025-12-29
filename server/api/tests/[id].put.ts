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

    // 認証チェック
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: '認証に失敗しました'
      })
    }

    // 組織管理者かどうかをチェック
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    if (userRole !== 'org_admin' && userRole !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        message: 'テストの更新は組織管理者のみ可能です'
      })
    }

    // テストIDを取得
    const testId = parseInt(event.context.params?.id || '0')
    if (!testId) {
      throw createError({
        statusCode: 400,
        message: '無効なテストIDです'
      })
    }

    // リクエストボディを取得
    const body = await readBody(event)
    const { title, videoId, questions } = body

    // バリデーション
    if (!title || !videoId || !questions || questions.length === 0) {
      throw createError({
        statusCode: 400,
        message: '必須項目が不足しています'
      })
    }

    // テストが存在するか確認
    const { data: existingTest, error: testCheckError } = await supabaseAdmin
      .from('tests')
      .select('id')
      .eq('id', testId)
      .single()

    if (testCheckError || !existingTest) {
      throw createError({
        statusCode: 404,
        message: 'テストが見つかりません'
      })
    }

    // トランザクション的にテストを更新
    // 1. テスト基本情報を更新
    const { error: testUpdateError } = await supabaseAdmin
      .from('tests')
      .update({
        title,
        video_id: videoId,
        updated_at: new Date().toISOString()
      })
      .eq('id', testId)

    if (testUpdateError) {
      console.error('[API/Tests/[id].PUT] Error updating test:', testUpdateError)
      throw createError({
        statusCode: 500,
        message: 'テストの更新に失敗しました'
      })
    }

    // 2. 既存の問題と選択肢を削除（カスケード削除）
    const { error: deleteQuestionsError } = await supabaseAdmin
      .from('test_questions')
      .delete()
      .eq('test_id', testId)

    if (deleteQuestionsError) {
      console.error('[API/Tests/[id].PUT] Error deleting questions:', deleteQuestionsError)
      throw createError({
        statusCode: 500,
        message: '既存の問題の削除に失敗しました'
      })
    }

    // 3. 新しい問題を作成
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      
      const { data: createdQuestion, error: questionError } = await supabaseAdmin
        .from('test_questions')
        .insert({
          test_id: testId,
          question_order: i + 1,
          question_text: question.text,
          question_type: question.type
        })
        .select()
        .single()

      if (questionError) {
        console.error('[API/Tests/[id].PUT] Error creating question:', questionError)
        throw createError({
          statusCode: 500,
          message: '問題の作成に失敗しました'
        })
      }

      // 4. 選択肢を作成
      for (let j = 0; j < question.choices.length; j++) {
        const choice = question.choices[j]
        
        const { error: choiceError } = await supabaseAdmin
          .from('test_choices')
          .insert({
            question_id: createdQuestion.id,
            choice_order: j + 1,
            choice_text: choice.text,
            is_correct: choice.isCorrect
          })

        if (choiceError) {
          console.error('[API/Tests/[id].PUT] Error creating choice:', choiceError)
          throw createError({
            statusCode: 500,
            message: '選択肢の作成に失敗しました'
          })
        }
      }
    }

    console.log('[API/Tests/[id].PUT] Test updated successfully:', testId)

    return {
      success: true,
      testId: testId,
      message: 'テストを更新しました'
    }
  } catch (error: any) {
    console.error('Error in test PUT API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの更新に失敗しました'
    })
  }
})










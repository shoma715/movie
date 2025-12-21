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
        message: 'テストの作成は組織管理者のみ可能です'
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

    // ユーザーの組織を取得
    const organization = user.user_metadata?.organization || ''

    // トランザクション的にテストを作成
    // 1. テストを作成
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .insert({
        title,
        video_id: videoId,
        organization,
        created_by: user.id
      })
      .select()
      .single()

    if (testError) {
      console.error('[API/Tests.POST] Error creating test:', testError)
      throw createError({
        statusCode: 500,
        message: 'テストの作成に失敗しました'
      })
    }

    // 2. 問題を作成
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      
      const { data: createdQuestion, error: questionError } = await supabaseAdmin
        .from('test_questions')
        .insert({
          test_id: test.id,
          question_order: i + 1,
          question_text: question.text,
          question_type: question.type
        })
        .select()
        .single()

      if (questionError) {
        console.error('[API/Tests.POST] Error creating question:', questionError)
        // ロールバック: テストを削除
        await supabaseAdmin.from('tests').delete().eq('id', test.id)
        throw createError({
          statusCode: 500,
          message: '問題の作成に失敗しました'
        })
      }

      // 3. 選択肢を作成
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
          console.error('[API/Tests.POST] Error creating choice:', choiceError)
          // ロールバック: テストを削除（カスケード削除で問題・選択肢も削除される）
          await supabaseAdmin.from('tests').delete().eq('id', test.id)
          throw createError({
            statusCode: 500,
            message: '選択肢の作成に失敗しました'
          })
        }
      }
    }

    console.log('[API/Tests.POST] Test created successfully:', test.id)

    return {
      success: true,
      testId: test.id,
      message: 'テストを作成しました'
    }
  } catch (error: any) {
    console.error('Error in tests POST API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの作成に失敗しました'
    })
  }
})






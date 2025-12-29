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
    const { answers, score, maxScore, elapsedTime } = body

    // バリデーション
    if (!answers || score === undefined || maxScore === undefined) {
      throw createError({
        statusCode: 400,
        message: '必須項目が不足しています'
      })
    }

    const now = new Date().toISOString()

    // 受験履歴を作成
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .insert({
        test_id: testId,
        user_id: user.id,
        score: score,
        max_score: maxScore,
        started_at: new Date(Date.now() - (elapsedTime || 0) * 1000).toISOString(),
        completed_at: now,
        is_completed: true
      })
      .select()
      .single()

    if (attemptError) {
      console.error('[API/Tests/[id]/Submit.POST] Error creating attempt:', attemptError)
      throw createError({
        statusCode: 500,
        message: 'テスト受験履歴の作成に失敗しました'
      })
    }

    // 回答を保存
    for (const answer of answers) {
      const { questionId, choiceIds } = answer
      
      for (const choiceId of choiceIds) {
        const { error: answerError } = await supabaseAdmin
          .from('test_answers')
          .insert({
            attempt_id: attempt.id,
            question_id: questionId,
            choice_id: choiceId
          })

        if (answerError) {
          console.error('[API/Tests/[id]/Submit.POST] Error saving answer:', answerError)
          // エラーがあっても続行（部分的な保存を許可）
        }
      }
    }

    console.log('[API/Tests/[id]/Submit.POST] Test submitted successfully:', {
      testId,
      userId: user.id,
      attemptId: attempt.id,
      score,
      maxScore
    })

    return {
      success: true,
      attemptId: attempt.id,
      score,
      maxScore,
      message: 'テストを提出しました'
    }
  } catch (error: any) {
    console.error('Error in test submit API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの提出に失敗しました'
    })
  }
})










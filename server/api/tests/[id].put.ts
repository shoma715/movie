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
    const { title, videoId, courseId, skills, questions } = body

    // バリデーション
    if (!title || !questions || questions.length === 0) {
      throw createError({
        statusCode: 400,
        message: '必須項目が不足しています'
      })
    }

    // 動画IDまたはコースIDのどちらか一方が必須
    if (!videoId && !courseId) {
      throw createError({
        statusCode: 400,
        message: '動画またはコースのどちらかを選択してください'
      })
    }

    // 動画IDとコースIDの両方が指定されている場合はエラー
    if (videoId && courseId) {
      throw createError({
        statusCode: 400,
        message: '動画とコースの両方を選択することはできません'
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
    const updateData: any = {
      title,
      video_id: videoId || null,
      course_id: courseId || null,
      updated_at: new Date().toISOString()
    }

    const { error: testUpdateError } = await supabaseAdmin
      .from('tests')
      .update(updateData)
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

    // 4. テストスキルの紐づけを更新
    // 既存のtest_skillsを削除
    const { error: deleteTestSkillsError } = await supabaseAdmin
      .from('test_skills')
      .delete()
      .eq('test_id', testId)

    if (deleteTestSkillsError) {
      console.error('[API/Tests/[id].PUT] Error deleting test_skills:', deleteTestSkillsError)
      // エラーがあっても続行（部分的な保存を許可）
    }

    // 新しいスキルを紐づけ（複数可能）
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillData of skills) {
        const { skillId, proficiencyLevelOnPass } = skillData
        if (skillId && proficiencyLevelOnPass) {
          const skillIdNum = parseInt(String(skillId), 10)
          if (!isNaN(skillIdNum) && ['triangle', 'circle', 'double_circle'].includes(proficiencyLevelOnPass)) {
            const { error: testSkillError } = await supabaseAdmin
              .from('test_skills')
              .insert({
                test_id: testId,
                skill_id: skillIdNum,
                proficiency_level_on_pass: proficiencyLevelOnPass
              })

            if (testSkillError) {
              console.error('[API/Tests/[id].PUT] Error creating test_skill:', testSkillError)
              // エラーがあっても続行（部分的な保存を許可）
            }
          }
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











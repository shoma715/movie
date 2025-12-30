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
    const { title, videoId, courseId, skills, questions } = body

    console.log('[API/Tests.POST] Request body:', { title, videoId, courseId, questionsCount: questions?.length })
    console.log('[API/Tests.POST] Skills from request:', JSON.stringify(skills, null, 2))

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

    // IDを数値に変換（文字列で送信される可能性があるため）
    const videoIdNum = videoId ? parseInt(String(videoId), 10) : null
    const courseIdNum = courseId ? parseInt(String(courseId), 10) : null

    if (videoId && isNaN(videoIdNum!)) {
      throw createError({
        statusCode: 400,
        message: '無効な動画IDです'
      })
    }

    if (courseId && isNaN(courseIdNum!)) {
      throw createError({
        statusCode: 400,
        message: '無効なコースIDです'
      })
    }

    // ユーザーの組織を取得
    const organization = user.user_metadata?.organization || ''

    // トランザクション的にテストを作成
    // 1. テストを作成
    const insertData: any = {
      title,
      organization,
      created_by: user.id
    }

    if (videoIdNum) {
      insertData.video_id = videoIdNum
      insertData.course_id = null
    } else if (courseIdNum) {
      insertData.video_id = null
      insertData.course_id = courseIdNum
    }

    console.log('[API/Tests.POST] Inserting test with data:', insertData)

    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .insert(insertData)
      .select()
      .single()

    if (testError) {
      console.error('[API/Tests.POST] Error creating test:', testError)
      console.error('[API/Tests.POST] Error details:', JSON.stringify(testError, null, 2))
      
      // データベーススキーマエラーの場合
      if (testError.message?.includes('column') && testError.message?.includes('does not exist')) {
        throw createError({
          statusCode: 500,
          message: 'データベーススキーマが更新されていません。course_idカラムが存在しません。supabase-setup-tests.sqlのマイグレーションを実行してください。'
        })
      }
      
      // 外部キー制約エラーの場合
      if (testError.code === '23503' || testError.message?.includes('foreign key')) {
        throw createError({
          statusCode: 400,
          message: `選択したコースが見つかりません。コースID: ${courseId}`
        })
      }
      
      // CHECK制約エラーの場合
      if (testError.code === '23514' || testError.message?.includes('check constraint')) {
        throw createError({
          statusCode: 400,
          message: '動画またはコースのどちらか一方のみを選択してください'
        })
      }
      
      throw createError({
        statusCode: 500,
        message: `テストの作成に失敗しました: ${testError.message || 'Unknown error'}${testError.details ? ` (${testError.details})` : ''}`
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

    // 4. スキルを紐づけ（複数可能）
    console.log('[API/Tests.POST] Processing skills:', JSON.stringify(skills, null, 2))
    if (skills && Array.isArray(skills) && skills.length > 0) {
      console.log('[API/Tests.POST] Found', skills.length, 'skills to link')
      for (const skillData of skills) {
        const { skillId, proficiencyLevelOnPass } = skillData
        console.log('[API/Tests.POST] Processing skill:', { skillId, proficiencyLevelOnPass })
        
        if (skillId && proficiencyLevelOnPass) {
          const skillIdNum = parseInt(String(skillId), 10)
          console.log('[API/Tests.POST] Validating skill:', {
            skillId,
            skillIdNum,
            proficiencyLevelOnPass,
            proficiencyLevelOnPassLength: proficiencyLevelOnPass?.length,
            isValidLevel: ['triangle', 'circle', 'double_circle'].includes(proficiencyLevelOnPass)
          })
          
          if (!isNaN(skillIdNum) && ['triangle', 'circle', 'double_circle'].includes(proficiencyLevelOnPass)) {
            console.log('[API/Tests.POST] Inserting test_skill:', {
              test_id: test.id,
              skill_id: skillIdNum,
              proficiency_level_on_pass: proficiencyLevelOnPass
            })
            
            const { data: insertedData, error: testSkillError } = await supabaseAdmin
              .from('test_skills')
              .insert({
                test_id: test.id,
                skill_id: skillIdNum,
                proficiency_level_on_pass: proficiencyLevelOnPass
              })
              .select()

            if (testSkillError) {
              console.error('[API/Tests.POST] Error creating test_skill:', testSkillError)
              console.error('[API/Tests.POST] Error details:', JSON.stringify(testSkillError, null, 2))
              // エラーがあっても続行（部分的な保存を許可）
            } else {
              console.log('[API/Tests.POST] Successfully created test_skill:', insertedData)
            }
          } else {
            console.warn('[API/Tests.POST] Invalid skill data:', { skillId, skillIdNum, proficiencyLevelOnPass })
          }
        } else {
          console.warn('[API/Tests.POST] Missing skill data:', { skillId, proficiencyLevelOnPass })
        }
      }
    } else {
      console.log('[API/Tests.POST] No skills to link')
    }

    console.log('[API/Tests.POST] Test created successfully:', test.id)

    return {
      success: true,
      testId: test.id,
      message: 'テストを作成しました'
    }
  } catch (error: any) {
    console.error('Error in tests POST API:', error)
    console.error('Error stack:', error.stack)
    
    // 既にcreateErrorでラップされている場合はそのまま返す
    if (error.statusCode) {
      throw error
    }
    
    // データベースエラーの詳細をログに出力
    if (error.message) {
      console.error('Error message:', error.message)
    }
    if (error.details) {
      console.error('Error details:', error.details)
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの作成に失敗しました'
    })
  }
})











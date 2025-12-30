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

    // テスト情報を取得（スキル情報を含む）
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('id')
      .eq('id', testId)
      .single()

    if (testError) {
      console.error('[API/Tests/[id]/Submit.POST] Error fetching test:', testError)
      // テスト情報の取得エラーは続行を妨げない
    }

    // テストに紐づくスキルを取得（test_skillsテーブルから）
    let testSkills: Array<{ skill_id: number; proficiency_level_on_pass: string }> | null = null
    const { data: testSkillsData, error: testSkillsError } = await supabaseAdmin
      .from('test_skills')
      .select('skill_id, proficiency_level_on_pass')
      .eq('test_id', testId)

    console.log('[API/Tests/[id]/Submit.POST] Fetching test_skills for testId:', testId)
    
    if (testSkillsError) {
      console.error('[API/Tests/[id]/Submit.POST] Error fetching test_skills:', testSkillsError)
      console.error('[API/Tests/[id]/Submit.POST] Error code:', testSkillsError.code)
      console.error('[API/Tests/[id]/Submit.POST] Error message:', testSkillsError.message)
      
      // test_skillsテーブルが存在しない場合、古い形式（tests.skill_id）を確認
      const { data: oldTest, error: oldTestError } = await supabaseAdmin
        .from('tests')
        .select('skill_id, proficiency_level_on_pass')
        .eq('id', testId)
        .single()
      
      if (oldTestError) {
        console.error('[API/Tests/[id]/Submit.POST] Error fetching old test:', oldTestError)
      }
      
      if (oldTest && oldTest.skill_id) {
        testSkills = [{
          skill_id: oldTest.skill_id,
          proficiency_level_on_pass: oldTest.proficiency_level_on_pass || 'circle'
        }]
        console.log('[API/Tests/[id]/Submit.POST] Using legacy skill_id from tests table:', testSkills)
      } else {
        console.log('[API/Tests/[id]/Submit.POST] No skills found for test:', testId)
      }
    } else {
      testSkills = testSkillsData
      console.log('[API/Tests/[id]/Submit.POST] Fetched test_skills:', testSkills)
      console.log('[API/Tests/[id]/Submit.POST] test_skills count:', testSkills?.length || 0)
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

    // テストに合格した場合（満点）、紐づくすべてのスキルの習熟度を更新
    console.log('[API/Tests/[id]/Submit.POST] ========== PROFICIENCY UPDATE CHECK ==========')
    console.log('[API/Tests/[id]/Submit.POST] Test exists:', !!test)
    console.log('[API/Tests/[id]/Submit.POST] Score:', score, '/', maxScore)
    console.log('[API/Tests/[id]/Submit.POST] Is perfect score:', score === maxScore)
    console.log('[API/Tests/[id]/Submit.POST] Test skills count:', testSkills?.length || 0)
    console.log('[API/Tests/[id]/Submit.POST] Test skills:', JSON.stringify(testSkills, null, 2))
    console.log('[API/Tests/[id]/Submit.POST] User ID:', user.id)
    console.log('[API/Tests/[id]/Submit.POST] ===============================================')
    
    if (test && score === maxScore && testSkills && testSkills.length > 0) {
      console.log('[API/Tests/[id]/Submit.POST] Starting proficiency update for', testSkills.length, 'skills')
      for (const testSkill of testSkills) {
        try {
          const { skill_id, proficiency_level_on_pass } = testSkill
          console.log('[API/Tests/[id]/Submit.POST] Processing skill:', { skill_id, proficiency_level_on_pass })
          
          if (!skill_id || !proficiency_level_on_pass) {
            console.log('[API/Tests/[id]/Submit.POST] Skipping skill (missing data):', { skill_id, proficiency_level_on_pass })
            continue
          }

          // 既存の習熟度を確認（single()ではなく、maybeSingle()を使用）
          console.log('[API/Tests/[id]/Submit.POST] Fetching existing proficiency for skill_id:', skill_id, 'user_id:', user.id)
          const { data: existingProficiency, error: fetchError } = await supabaseAdmin
            .from('skill_proficiencies')
            .select('id, proficiency_level')
            .eq('skill_id', skill_id)
            .eq('user_id', user.id)
            .maybeSingle()

          if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116は「行が見つからない」エラーなので無視
            console.error('[API/Tests/[id]/Submit.POST] Error fetching proficiency:', fetchError)
          } else {
            console.log('[API/Tests/[id]/Submit.POST] Existing proficiency:', existingProficiency)
          }

          const proficiencyLevels = ['none', 'triangle', 'circle', 'double_circle']
          const currentLevel = proficiencyLevels.indexOf(existingProficiency?.proficiency_level || 'none')
          const newLevel = proficiencyLevels.indexOf(proficiency_level_on_pass)

          console.log('[API/Tests/[id]/Submit.POST] Level comparison:', {
            currentLevel,
            currentLevelName: existingProficiency?.proficiency_level || 'none',
            newLevel,
            newLevelName: proficiency_level_on_pass,
            shouldUpdate: newLevel > currentLevel
          })

          // 新しいレベルが現在のレベルより高い場合のみ更新
          if (newLevel > currentLevel) {
            console.log('[API/Tests/[id]/Submit.POST] Updating proficiency (new level is higher)')
            if (existingProficiency && existingProficiency.id) {
              // 既存の習熟度を更新
              const { error: updateError } = await supabaseAdmin
                .from('skill_proficiencies')
                .update({
                  proficiency_level: proficiency_level_on_pass,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingProficiency.id)

              if (updateError) {
                console.error('[API/Tests/[id]/Submit.POST] Error updating proficiency:', updateError)
                console.error('[API/Tests/[id]/Submit.POST] Update error details:', JSON.stringify(updateError, null, 2))
              } else {
                console.log('[API/Tests/[id]/Submit.POST] Proficiency updated:', {
                  skillId: skill_id,
                  userId: user.id,
                  level: proficiency_level_on_pass
                })
              }
            } else {
              // 新しい習熟度を作成
              const { error: insertError } = await supabaseAdmin
                .from('skill_proficiencies')
                .insert({
                  skill_id: skill_id,
                  user_id: user.id,
                  proficiency_level: proficiency_level_on_pass
                })

              if (insertError) {
                console.error('[API/Tests/[id]/Submit.POST] Error creating proficiency:', insertError)
                console.error('[API/Tests/[id]/Submit.POST] Insert error details:', JSON.stringify(insertError, null, 2))
              } else {
                console.log('[API/Tests/[id]/Submit.POST] Proficiency created:', {
                  skillId: skill_id,
                  userId: user.id,
                  level: proficiency_level_on_pass
                })
              }
            }
          } else {
            console.log('[API/Tests/[id]/Submit.POST] Proficiency not updated (current level is same or higher):', {
              skillId: skill_id,
              userId: user.id,
              currentLevel: existingProficiency?.proficiency_level || 'none',
              newLevel: proficiency_level_on_pass
            })
          }
        } catch (error) {
          // 習熟度更新のエラーはテスト提出を妨げない
          console.error('[API/Tests/[id]/Submit.POST] Error updating proficiency (non-blocking):', error)
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












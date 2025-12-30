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

    // テストIDを取得
    const testId = parseInt(event.context.params?.id || '0')
    if (!testId) {
      throw createError({
        statusCode: 400,
        message: '無効なテストIDです'
      })
    }

    // テスト情報を取得
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      console.error('[API/Tests/[id].GET] Error fetching test:', testError)
      throw createError({
        statusCode: 404,
        message: 'テストが見つかりません'
      })
    }

    // 問題を取得
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('[API/Tests/[id].GET] Error fetching questions:', questionsError)
      throw createError({
        statusCode: 500,
        message: '問題の取得に失敗しました'
      })
    }

    // 各問題の選択肢を取得
    const questionsWithChoices = await Promise.all(
      (questions || []).map(async (question) => {
        const { data: choices, error: choicesError } = await supabaseAdmin
          .from('test_choices')
          .select('*')
          .eq('question_id', question.id)
          .order('choice_order', { ascending: true })

        if (choicesError) {
          console.error('[API/Tests/[id].GET] Error fetching choices:', choicesError)
          return {
            ...question,
            choices: []
          }
        }

        return {
          id: question.id,
          text: question.question_text,
          type: question.question_type,
          order: question.question_order,
          choices: (choices || []).map(choice => ({
            id: choice.id,
            text: choice.choice_text,
            isCorrect: choice.is_correct,
            order: choice.choice_order
          }))
        }
      })
    )

    // 動画情報を取得（video_idがある場合）
    let videoTitle = null
    if (test.video_id) {
      const { data: video } = await supabaseAdmin
        .from('videos')
        .select('title')
        .eq('id', test.video_id)
        .single()
      videoTitle = video?.title || '不明な動画'
    }

    // コース情報を取得（course_idがある場合）
    let courseTitle = null
    if (test.course_id) {
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('name')
        .eq('id', test.course_id)
        .single()
      courseTitle = course?.name || '不明なコース'
    }

    // テストに紐づくスキルを取得
    const { data: testSkills } = await supabaseAdmin
      .from('test_skills')
      .select('skill_id, proficiency_level_on_pass')
      .eq('test_id', test.id)

    const skills = (testSkills || []).map(ts => ({
      skillId: ts.skill_id,
      proficiencyLevelOnPass: ts.proficiency_level_on_pass
    }))

    const result = {
      id: test.id,
      title: test.title,
      videoId: test.video_id,
      videoTitle: videoTitle,
      courseId: test.course_id,
      courseTitle: courseTitle,
      skills: skills,
      // 後方互換性のため、skillIdとproficiencyLevelOnPassも残す（最初のスキルのみ）
      skillId: skills.length > 0 ? skills[0].skillId : test.skill_id,
      proficiencyLevelOnPass: skills.length > 0 ? skills[0].proficiencyLevelOnPass : test.proficiency_level_on_pass,
      organization: test.organization,
      createdBy: test.created_by,
      createdAt: test.created_at,
      updatedAt: test.updated_at,
      questions: questionsWithChoices
    }

    console.log('[API/Tests/[id].GET] Returning test:', testId)

    return result
  } catch (error: any) {
    console.error('Error in test GET API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'テストの取得に失敗しました'
    })
  }
})











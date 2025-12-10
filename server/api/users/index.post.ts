export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, username, password, role, organization } = body

    // バリデーション
    if (!email || !username || !password) {
      throw createError({
        statusCode: 400,
        message: 'メールアドレス、ユーザー名、パスワードは必須です'
      })
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: '有効なメールアドレスを入力してください'
      })
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'パスワードは6文字以上である必要があります'
      })
    }

    // Supabase Admin Clientを作成（service role keyを使用）
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabase?.url
    const supabaseServiceKey = config.supabase?.serviceKey

    if (!supabaseServiceKey || !supabaseUrl) {
      throw createError({
        statusCode: 500,
        message: 'Supabase service keyまたはURLが設定されていません。環境変数を確認してください。'
      })
    }

    // 動的インポートを使用してサーバーサイドのみで読み込む
    const { createClient } = await import('@supabase/supabase-js')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // ユーザーを作成
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認をスキップ
      user_metadata: {
        username: username,
        display_name: username,
        role: role || 'user',
        organization: organization || '自組織 (ID: 2)'
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      throw createError({
        statusCode: 400,
        message: authError.message || 'ユーザーの作成に失敗しました'
      })
    }

    if (!authData.user) {
      throw createError({
        statusCode: 500,
        message: 'ユーザーの作成に失敗しました'
      })
    }

    // ユーザー情報を返す
    return {
      id: authData.user.id,
      email: authData.user.email,
      displayName: username,
      organization: organization || '自組織 (ID: 2)',
      role: role || 'user',
      active: true
    }
  } catch (error: any) {
    console.error('Error in user creation API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'ユーザーの作成に失敗しました'
    })
  }
})

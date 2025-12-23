import { createError, defineEventHandler, readFormData } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const openaiApiKey = config.openai?.apiKey

    console.log('[Transcribe] API Key check:', {
      hasApiKey: !!openaiApiKey,
      apiKeyLength: openaiApiKey?.length || 0,
      apiKeyPrefix: openaiApiKey?.substring(0, 7) || 'N/A'
    })

    if (!openaiApiKey) {
      console.error('[Transcribe] OpenAI API key is not set')
      throw createError({
        statusCode: 500,
        message: 'OpenAI APIキーが設定されていません。環境変数OPENAI_API_KEYを確認してください。'
      })
    }

    // FormDataから動画ファイルを取得
    let requestFormData: FormData
    try {
      requestFormData = await readFormData(event)
    } catch (formDataError: any) {
      console.error('[Transcribe] Error reading FormData:', formDataError)
      throw createError({
        statusCode: 400,
        message: `FormDataの読み込みに失敗しました: ${formDataError.message}`
      })
    }

    const videoFile = requestFormData.get('video') as File | null

    if (!videoFile) {
      console.error('[Transcribe] Video file not found in FormData')
      throw createError({
        statusCode: 400,
        message: '動画ファイルが必要です。FormDataに"video"キーが含まれていません。'
      })
    }

    console.log('[Transcribe] Received video file:', {
      name: videoFile.name,
      size: videoFile.size,
      type: videoFile.type
    })

    // OpenAI API用のFormDataを作成
    const openaiFormData = new FormData()
    openaiFormData.append('file', videoFile)
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('language', 'ja') // 日本語を指定
    openaiFormData.append('response_format', 'verbose_json') // 詳細なJSON形式でレスポンスを取得

    // OpenAI Whisper APIを呼び出し
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: openaiFormData
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text().catch(() => '')
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || openaiResponse.statusText }
      }
      
      console.error('[Transcribe] OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData,
        hasApiKey: !!openaiApiKey,
        apiKeyPrefix: openaiApiKey?.substring(0, 7) || 'N/A'
      })
      
      // 401エラーの場合は、APIキーの問題であることを明確にする
      if (openaiResponse.status === 401) {
        throw createError({
          statusCode: 401,
          message: `OpenAI API認証エラー: APIキーが無効または設定されていません。環境変数OPENAI_API_KEYを確認してください。詳細: ${errorData.error?.message || errorData.message || openaiResponse.statusText}`
        })
      }
      
      throw createError({
        statusCode: openaiResponse.status,
        message: `OpenAI APIエラー (${openaiResponse.status}): ${errorData.error?.message || errorData.message || openaiResponse.statusText}`
      })
    }

    const transcriptionData = await openaiResponse.json()

    // 文字起こし結果を返す
    return {
      text: transcriptionData.text || '',
      segments: transcriptionData.segments || [] // セグメント情報（開始時間、終了時間など）
    }
  } catch (error: any) {
    console.error('[Transcribe] Error in transcribe API:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    })
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || '文字起こしに失敗しました'
    })
  }
})


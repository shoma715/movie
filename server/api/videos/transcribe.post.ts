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

    // ファイルサイズチェック（Whisper APIの制限は25MB）
    const maxFileSize = 25 * 1024 * 1024 // 25MB
    if (videoFile.size > maxFileSize) {
      console.error('[Transcribe] File size exceeds limit:', {
        size: videoFile.size,
        maxSize: maxFileSize,
        sizeInMB: (videoFile.size / 1024 / 1024).toFixed(2)
      })
      throw createError({
        statusCode: 400,
        message: `ファイルサイズが大きすぎます。Whisper APIの制限は25MBです。現在のファイルサイズ: ${(videoFile.size / 1024 / 1024).toFixed(2)}MB`
      })
    }

    // ファイル形式の確認と調整
    // Whisper APIはmp4の音声トラックを抽出できますが、ファイル名の拡張子が重要
    let fileToSend = videoFile
    const fileName = videoFile.name.toLowerCase()
    
    // mp3ファイルの場合はそのまま送信
    if (fileName.endsWith('.mp3')) {
      console.log('[Transcribe] Using MP3 file as-is:', {
        name: videoFile.name,
        type: videoFile.type
      })
      fileToSend = videoFile
    }
    // wavファイルの場合はそのまま送信
    else if (fileName.endsWith('.wav')) {
      console.log('[Transcribe] Using WAV file as-is:', {
        name: videoFile.name,
        type: videoFile.type
      })
      fileToSend = videoFile
    }
    // mp4ファイルの場合、m4aとして送信（Whisper APIが音声トラックを抽出しやすくするため）
    else if (fileName.endsWith('.mp4')) {
      // ファイル名を変更して送信（実際のファイル内容は変更しない）
      fileToSend = new File([videoFile], videoFile.name.replace(/\.mp4$/i, '.m4a'), {
        type: 'audio/mp4' // または 'audio/x-m4a'
      })
      console.log('[Transcribe] Converted mp4 to m4a for Whisper API:', {
        originalName: videoFile.name,
        newName: fileToSend.name,
        newType: fileToSend.type
      })
    }
    // その他の形式はそのまま送信
    else {
      console.log('[Transcribe] Using file as-is:', {
        name: videoFile.name,
        type: videoFile.type
      })
      fileToSend = videoFile
    }

    // OpenAI API用のFormDataを作成
    const openaiFormData = new FormData()
    openaiFormData.append('file', fileToSend)
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('language', 'ja') // 日本語を指定
    openaiFormData.append('response_format', 'verbose_json') // 詳細なJSON形式でレスポンスを取得

    // リクエスト情報をログに出力
    console.log('[Transcribe] ===== OpenAI API リクエスト情報 =====')
    console.log('[Transcribe] URL: https://api.openai.com/v1/audio/transcriptions')
    console.log('[Transcribe] Method: POST')
    console.log('[Transcribe] Headers:', {
      'Authorization': `Bearer ${openaiApiKey.substring(0, 7)}...${openaiApiKey.substring(openaiApiKey.length - 4)}`
    })
    console.log('[Transcribe] FormData fields:', {
      file: {
        name: fileToSend.name,
        size: fileToSend.size,
        type: fileToSend.type
      },
      model: 'whisper-1',
      language: 'ja',
      response_format: 'verbose_json'
    })
    console.log('[Transcribe] ======================================')

    // OpenAI Whisper APIを呼び出し
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: openaiFormData
    })

    // レスポンス情報をログに出力
    console.log('[Transcribe] ===== OpenAI API レスポンス情報 =====')
    console.log('[Transcribe] Status:', openaiResponse.status)
    console.log('[Transcribe] Status Text:', openaiResponse.statusText)
    console.log('[Transcribe] Headers:', Object.fromEntries(openaiResponse.headers.entries()))

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text().catch(() => '')
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || openaiResponse.statusText }
      }
      
      console.error('[Transcribe] ===== OpenAI API エラーレスポンス =====')
      console.error('[Transcribe] Status:', openaiResponse.status)
      console.error('[Transcribe] Status Text:', openaiResponse.statusText)
      console.error('[Transcribe] Error Response Body (Raw):', errorText)
      console.error('[Transcribe] Error Response Body (Parsed):', JSON.stringify(errorData, null, 2))
      console.error('[Transcribe] File Info:', {
        name: videoFile.name,
        size: videoFile.size,
        sizeInMB: (videoFile.size / 1024 / 1024).toFixed(2),
        type: videoFile.type
      })
      console.error('[Transcribe] ========================================')
      
      // 401エラーの場合は、APIキーの問題であることを明確にする
      if (openaiResponse.status === 401) {
        throw createError({
          statusCode: 401,
          message: `OpenAI API認証エラー: APIキーが無効または設定されていません。環境変数OPENAI_API_KEYを確認してください。詳細: ${errorData.error?.message || errorData.message || openaiResponse.statusText}`
        })
      }
      
      // 400エラーの場合は、ファイル形式の問題である可能性が高い
      if (openaiResponse.status === 400) {
        const errorMessage = errorData.error?.message || errorData.message || openaiResponse.statusText
        throw createError({
          statusCode: 400,
          message: `ファイル形式エラー: ${errorMessage}\n\n考えられる原因:\n- ファイル形式がサポートされていない\n- ファイルが破損している\n- ファイルサイズが大きすぎる（25MB制限）\n\nファイル情報: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB, ${videoFile.type})`
        })
      }
      
      throw createError({
        statusCode: openaiResponse.status,
        message: `OpenAI APIエラー (${openaiResponse.status}): ${errorData.error?.message || errorData.message || openaiResponse.statusText}`
      })
    }

    // レスポンスをテキストとして取得（JSONパース前に確認）
    const responseText = await openaiResponse.text()
    console.log('[Transcribe] ===== OpenAI API 生レスポンス（テキスト） =====')
    console.log('[Transcribe] Raw Response (first 2000 chars):', responseText.substring(0, 2000))
    
    // JSONパース
    const transcriptionData = JSON.parse(responseText)

    // 成功時のレスポンスをログに出力
    console.log('[Transcribe] ===== OpenAI API 成功レスポンス（パース後） =====')
    console.log('[Transcribe] Response Body (Full):', JSON.stringify(transcriptionData, null, 2))
    console.log('[Transcribe] Text:', transcriptionData.text || '(empty)')
    console.log('[Transcribe] Segments Count:', transcriptionData.segments?.length || 0)
    if (transcriptionData.segments && transcriptionData.segments.length > 0) {
      console.log('[Transcribe] First Segment:', JSON.stringify(transcriptionData.segments[0], null, 2))
      console.log('[Transcribe] First Segment start type:', typeof transcriptionData.segments[0].start)
      console.log('[Transcribe] First Segment end type:', typeof transcriptionData.segments[0].end)
      if (transcriptionData.segments.length > 1) {
        console.log('[Transcribe] Last Segment:', JSON.stringify(transcriptionData.segments[transcriptionData.segments.length - 1], null, 2))
      }
    }
    console.log('[Transcribe] ======================================')

    // セグメントの時間を明示的に浮動小数点数として扱う
    if (transcriptionData.segments && transcriptionData.segments.length > 0) {
      transcriptionData.segments = transcriptionData.segments.map((segment: any) => ({
        ...segment,
        start: segment.start !== undefined && segment.start !== null ? parseFloat(segment.start.toString()) : 0,
        end: segment.end !== undefined && segment.end !== null ? parseFloat(segment.end.toString()) : segment.start || 0
      }))
    }

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


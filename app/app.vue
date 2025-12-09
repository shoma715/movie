<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const supabase = useSupabaseClient()

// FFmpeg関連
const ffmpeg = ref<FFmpeg | null>(null)
const isFFmpegLoading = ref(false)
const isFFmpegLoaded = ref(false)
const isTrimming = ref(false)
const isApplyingOverlays = ref(false)
const finalVideoUrl = ref<string | null>(null)

// 動画関連の状態
const videoFile = ref<File | null>(null)
const videoUrl = ref<string | null>(null)
const videoDuration = ref<number>(0)
const startTime = ref<number>(0)
const endTime = ref<number>(0)
const trimmedVideoUrl = ref<string | null>(null)

// パネルの表示状態
const activePanel = ref<'text' | 'image' | null>(null)

// テキスト挿入関連
const textItems = ref<Array<{ id: number; text: string; startTime: number; endTime: number }>>([])
let textItemIdCounter = 0

// 画像挿入関連
const imageItems = ref<Array<{ id: number; file: File | null; url: string | null; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; startTime: number; endTime: number }>>([])
let imageItemIdCounter = 0

// メディアライブラリ関連
const showMediaLibrary = ref(false)
const uploadedVideos = ref<Array<{ id: string; url: string; name: string }>>([])

// プレビュー用（トリミング後動画の現在時間）
const trimmedVideoCurrentTime = ref(0)

// トリミング後動画プレイヤーの参照
const trimmedVideoRef = ref<HTMLVideoElement | null>(null)

// 元動画の折りたたみ状態
const isOriginalVideoCollapsed = ref(false)

// 元動画のリセット
const clearVideo = () => {
  console.log('[Video] clearVideo called')

  // 動画関連の状態をすべてリセット
  videoFile.value = null
  videoUrl.value = null
  trimmedVideoUrl.value = null
  finalVideoUrl.value = null
  videoDuration.value = 0
  startTime.value = 0
  endTime.value = 0

  // テキスト・画像オーバーレイもクリア
  textItems.value = []
  imageItems.value = []

  // ファイル入力の値もクリア（同じファイルを再選択できるようにする）
  const inputEl = document.getElementById('video-input') as HTMLInputElement | null
  if (inputEl) {
    inputEl.value = ''
  }
}

// トリミング後動画のみリセット
const clearTrimmedVideo = () => {
  console.log('[Video] clearTrimmedVideo called')
  trimmedVideoUrl.value = null
  finalVideoUrl.value = null
  trimmedVideoCurrentTime.value = 0
}

// 最終動画のみリセット
const clearFinalVideo = () => {
  console.log('[Video] clearFinalVideo called')
  finalVideoUrl.value = null
}

// トリミング後動画の時間更新（リアルタイムプレビュー用）
const handleTrimmedTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  trimmedVideoCurrentTime.value = video.currentTime || 0
}

// 現在時間に表示すべきテキストオーバーレイ
const activeTextOverlays = computed(() => {
  const t = trimmedVideoCurrentTime.value
  return textItems.value.filter(item =>
    item.text.trim() !== '' &&
    item.startTime >= 0 &&
    item.endTime > item.startTime &&
    t >= item.startTime &&
    t <= item.endTime
  )
})

// 現在時間に表示すべき画像オーバーレイ
const activeImageOverlays = computed(() => {
  const t = trimmedVideoCurrentTime.value
  return imageItems.value.filter(item =>
    item.file &&
    item.startTime >= 0 &&
    item.endTime > item.startTime &&
    t >= item.startTime &&
    t <= item.endTime
  )
})

// 画像オーバーレイの位置スタイルを返す（画面を4分割した各エリアの中央）
const getImageOverlayStyle = (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
  switch (position) {
    case 'top-left':
      return { top: '25%', left: '25%', transform: 'translate(-50%, -50%)' }
    case 'top-right':
      return { top: '25%', left: '75%', transform: 'translate(-50%, -50%)' }
    case 'bottom-left':
      return { top: '75%', left: '25%', transform: 'translate(-50%, -50%)' }
    case 'bottom-right':
      return { top: '75%', left: '75%', transform: 'translate(-50%, -50%)' }
  }
}

// FFmpegの初期化
onMounted(async () => {
  // クライアントサイドでのみ実行
  if (import.meta.server) return
  
  // 少し遅延させてから読み込みを開始（DOMが完全に読み込まれた後）
  await new Promise(resolve => setTimeout(resolve, 100))
  
  try {
    isFFmpegLoading.value = true
    ffmpeg.value = new FFmpeg()
    
    // FFmpeg.wasmの読み込み（CDNから読み込み）
    let loaded = false
    const baseURLs = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    ]
    
    for (const baseURL of baseURLs) {
      try {
        console.log(`[FFmpeg] Attempting to load from: ${baseURL}`)
        
        // URLを取得
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        
        console.log('[FFmpeg] Core URL:', coreURL.substring(0, 100) + '...')
        console.log('[FFmpeg] WASM URL:', wasmURL.substring(0, 100) + '...')
        
        // FFmpegを読み込む（タイムアウトを設定）
        const loadPromise = ffmpeg.value.load({
          coreURL,
          wasmURL,
        })
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FFmpeg loading timeout')), 30000)
        )
        
        await Promise.race([loadPromise, timeoutPromise])
        
        // FFmpegが読み込まれた後にログイベントコールバックを設定
        // FFmpegのログを表示（「厨房の声」を聞こえるようにする）
        try {
          // FFmpeg.wasmのログイベントリスナーを設定
          if (ffmpeg.value) {
            // FFmpeg内部の詳細なログを表示
            ffmpeg.value.on('log', (event: any) => {
              // eventがオブジェクトの場合と文字列の場合の両方に対応
              if (typeof event === 'string') {
                console.log('[FFmpeg]', event)
              } else if (event && typeof event === 'object') {
                const type = event.type || 'info'
                const message = event.message || String(event)
                const prefix = type === 'fferr' ? '[FFmpeg ERROR]' : type === 'ffout' ? '[FFmpeg OUTPUT]' : '[FFmpeg INFO]'
                console.log(prefix, message)
              } else {
                console.log('[FFmpeg]', event)
              }
            })
            console.log('[FFmpeg] Log handler set up successfully')
          }
        } catch (logError: any) {
          console.warn('[FFmpeg] Could not set up log callback:', logError)
          // ログコールバックの設定に失敗しても続行（機能には影響しない）
        }
        
        loaded = true
        isFFmpegLoaded.value = true
        console.log('[FFmpeg] Loaded successfully from:', baseURL)
        break
      } catch (err: any) {
        console.warn(`[FFmpeg] Failed to load from ${baseURL}:`, err)
        console.warn('[FFmpeg] Error details:', {
          message: err?.message,
          name: err?.name,
          type: typeof err
        })
        continue
      }
    }
    
    if (!loaded) {
      throw new Error('Failed to load FFmpeg from all CDN sources. Please check your internet connection and try again.')
    }
  } catch (error: any) {
    console.error('[FFmpeg] Loading error:', error)
    console.error('[FFmpeg] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      type: typeof error
    })
    // エラーメッセージはUIで表示されるので、ここではalertを出さない
  } finally {
    isFFmpegLoading.value = false
  }
  
  // Supabaseから過去の動画を読み込む
  await loadMediaLibrary()
})

// Supabaseからメディアライブラリを読み込む
const loadMediaLibrary = async () => {
  try {
    // Supabaseが利用可能か確認
    if (!supabase) {
      console.warn('[MediaLibrary] Supabase client not available')
      return
    }
    
    const { data, error } = await supabase.storage
      .from('videos')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) {
      // ストレージバケットが存在しない場合などは警告のみ
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('[MediaLibrary] Storage bucket "videos" does not exist. This is OK if you haven\'t set up Supabase storage yet.')
        return
      }
      throw error
    }
    
    uploadedVideos.value = (data || []).map((file) => ({
      id: file.id || file.name,
      name: file.name,
      url: '' // URLは後で取得
    }))
    
    // 各動画のURLを取得
    for (const video of uploadedVideos.value) {
      try {
        const { data: urlData } = await supabase.storage
          .from('videos')
          .getPublicUrl(video.name)
        if (urlData) {
          video.url = urlData.publicUrl
        }
      } catch (urlError) {
        console.warn(`[MediaLibrary] Could not get URL for ${video.name}:`, urlError)
      }
    }
  } catch (error: any) {
    // ネットワークエラーやSupabase接続エラーは警告のみ（アプリは動作可能）
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      console.warn('[MediaLibrary] Could not connect to Supabase. Media library feature will be unavailable, but video editing will still work.')
    } else {
      console.error('[MediaLibrary] Error loading media library:', error)
    }
  }
}

// 動画ファイルの選択
const handleVideoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('video/')) {
    videoFile.value = file
    videoUrl.value = URL.createObjectURL(file)
    
    // 動画の長さを取得
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = videoUrl.value
    video.onloadedmetadata = () => {
      videoDuration.value = video.duration
      endTime.value = video.duration
    }
    
    // Supabaseにアップロード
    await uploadVideoToSupabase(file)
  }
}

// Supabaseに動画をアップロード
const uploadVideoToSupabase = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName
    
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) throw uploadError
    
    // メディアライブラリを更新
    await loadMediaLibrary()
  } catch (error) {
    console.error('Error uploading video:', error)
    // エラーが発生しても続行（ローカルで使用可能）
  }
}

// メディアライブラリから動画を選択
const selectVideoFromLibrary = async (video: { id: string; url: string; name: string }) => {
  videoUrl.value = video.url
  showMediaLibrary.value = false
  
  // 動画ファイルを取得
  try {
    const response = await fetch(video.url)
    const blob = await response.blob()
    videoFile.value = new File([blob], video.name, { type: blob.type })
  } catch (error) {
    console.error('Error fetching video file:', error)
  }
  
  // 動画の長さを取得
  const videoEl = document.createElement('video')
  videoEl.preload = 'metadata'
  videoEl.src = video.url
  videoEl.onloadedmetadata = () => {
    videoDuration.value = videoEl.duration
    endTime.value = videoEl.duration
  }
}

// 動画のトリミング
const applyTrim = async () => {
  if (!videoUrl.value) {
    alert('動画をアップロードしてください')
    return
  }
  
  if (!videoFile.value) {
    alert('動画ファイルが見つかりません。再度アップロードしてください。')
    return
  }
  
  if (!ffmpeg.value || !isFFmpegLoaded.value) {
    alert('動画編集エンジンが読み込まれていません。しばらく待ってから再度お試しください。\n\nページを再読み込み（F5キー）しても解決しない場合は、ブラウザのコンソール（F12キー）でエラーを確認してください。')
    return
  }
  
  if (startTime.value >= endTime.value) {
    alert('開始時間は終了時間より前である必要があります')
    return
  }
  
  if (endTime.value > videoDuration.value) {
    alert(`終了時間は動画の長さ（${videoDuration.value.toFixed(2)}秒）を超えることはできません`)
    return
  }
  
  try {
    isTrimming.value = true
    
    const duration = endTime.value - startTime.value
    console.log('[Trim] Starting trim:', {
      startTime: startTime.value,
      endTime: endTime.value,
      duration: duration,
      fileSize: videoFile.value.size,
      fileName: videoFile.value.name
    })
    
    // 入力ファイル名を動画の拡張子に合わせる
    const inputFileName = `input.${videoFile.value.name.split('.').pop() || 'mp4'}`
    const outputFileName = 'output.mp4'
    
    // 入力ファイルをFFmpegに書き込む
    console.log('[Trim] Writing input file:', inputFileName)
    await ffmpeg.value.writeFile(inputFileName, await fetchFile(videoFile.value))
    console.log('[Trim] Input file written')
    
    // トリミングコマンドを実行
    // まず-c copyを試行（高速だが正確でない場合がある）
    // 失敗した場合は再エンコードを試行
    console.log('[Trim] Executing FFmpeg command...')
    
    let command: string[] = []
    let useReencode = false
    
    // まず-c copyを試行（高速）
    try {
      command = [
        '-i', inputFileName,
        '-ss', startTime.value.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        '-avoid_negative_ts', 'make_zero',
        outputFileName
      ]
      
      console.log('[Trim] Trying with -c copy:', command.join(' '))
      
      await ffmpeg.value.exec(command)
      console.log('[Trim] FFmpeg command completed with -c copy')
    } catch (copyError: any) {
      console.warn('[Trim] -c copy failed, trying re-encode:', copyError)
      useReencode = true
    }
    
    // -c copyが失敗した場合、再エンコードを試行
    if (useReencode) {
      try {
        // 利用可能なコーデックを試行
        const codecOptions = [
          { video: 'libx264', audio: 'aac' },
          { video: 'libvpx-vp9', audio: 'libopus' },
          { video: 'libvpx', audio: 'libvorbis' }
        ]
        
        let reencodeSuccess = false
        for (const codecs of codecOptions) {
          try {
            command = [
              '-i', inputFileName,
              '-ss', startTime.value.toString(),
              '-t', duration.toString(),
              '-c:v', codecs.video,
              '-c:a', codecs.audio,
              '-preset', 'fast',
              '-crf', '23',
              outputFileName
            ]
            
            console.log('[Trim] Trying re-encode with:', codecs.video, codecs.audio)
            await ffmpeg.value.exec(command)
            console.log('[Trim] FFmpeg command completed with re-encode')
            reencodeSuccess = true
            break
          } catch (codecError) {
            console.warn('[Trim] Codec combination failed:', codecs, codecError)
            continue
          }
        }
        
        if (!reencodeSuccess) {
          throw new Error('All codec combinations failed')
        }
      } catch (reencodeError: any) {
        // 再エンコードも失敗した場合、シンプルなコマンドを試行
        console.log('[Trim] Trying simple command...')
        command = [
          '-i', inputFileName,
          '-ss', startTime.value.toString(),
          '-t', duration.toString(),
          outputFileName
        ]
        
        await ffmpeg.value.exec(command)
        console.log('[Trim] FFmpeg command completed with simple command')
      }
    }
    
    // 出力ファイルを読み込む
    console.log('[Trim] Reading output file...')
    const fileData = await ffmpeg.value.readFile(outputFileName)
    const data = fileData instanceof Uint8Array ? fileData : (typeof fileData === 'string' ? new TextEncoder().encode(fileData) : new Uint8Array(fileData as unknown as ArrayBuffer))
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
    trimmedVideoUrl.value = URL.createObjectURL(blob)
    console.log('[Trim] Output file created, size:', blob.size)
    
    // 一時ファイルを削除
    try {
      await ffmpeg.value.deleteFile(inputFileName)
      await ffmpeg.value.deleteFile(outputFileName)
    } catch (cleanupError) {
      console.warn('[Trim] Cleanup error (non-critical):', cleanupError)
    }
    
    alert('トリミングが完了しました')
  } catch (error: any) {
    console.error('[Trim] Error trimming video:', error)
    console.error('[Trim] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      type: typeof error
    })
    
    // より詳細なエラーメッセージを表示
    let errorMessage = '動画のトリミング中にエラーが発生しました。'
    
    if (error?.message) {
      if (error.message.includes('timeout') || error.message.includes('timeout')) {
        errorMessage += '\n\n動画が大きすぎるか、処理に時間がかかりすぎています。\nより短い動画でお試しください。'
      } else if (error.message.includes('memory') || error.message.includes('Memory')) {
        errorMessage += '\n\nメモリ不足です。\nより小さな動画ファイルでお試しください。'
      } else if (error.message.includes('format') || error.message.includes('codec')) {
        errorMessage += '\n\n動画形式が対応していない可能性があります。\nMP4形式の動画でお試しください。'
      } else {
        errorMessage += `\n\nエラー詳細: ${error.message}`
      }
    }
    
    errorMessage += '\n\nブラウザのコンソール（F12キー）で詳細なエラーを確認できます。'
    
    alert(errorMessage)
  } finally {
    isTrimming.value = false
  }
}

// テキストアイテムの追加
const addTextItem = () => {
  textItems.value.push({
    id: textItemIdCounter++,
    text: '',
    startTime: 0,
    endTime: 0
  })
}

// テキストアイテムの削除
const removeTextItem = (id: number) => {
  textItems.value = textItems.value.filter(item => item.id !== id)
}

// AI文字起こし（プレースホルダー）
const transcribeAudio = async () => {
  if (!videoFile.value && !videoUrl.value) {
    alert('動画をアップロードしてください')
    return
  }
  // TODO: AI文字起こしAPIを実装
  alert('AI文字起こし機能は今後実装予定です')
}

// 画像アイテムの追加
const addImageItem = () => {
  imageItems.value.push({
    id: imageItemIdCounter++,
    file: null,
    url: null,
    position: 'top-right',
    startTime: 0,
    endTime: 0
  })
}

// 画像アイテムの削除
const removeImageItem = (id: number) => {
  imageItems.value = imageItems.value.filter(item => item.id !== id)
}

// 画像ファイルの選択
const handleImageUpload = (event: Event, itemId: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const item = imageItems.value.find(i => i.id === itemId)
    if (item) {
      item.file = file
      item.url = URL.createObjectURL(file)
    }
  }
}

// パネルの切り替え
const togglePanel = (panel: 'text' | 'image' | null) => {
  activePanel.value = activePanel.value === panel ? null : panel
}

// メディアライブラリを開く
const openMediaLibrary = () => {
  showMediaLibrary.value = true
}

// テキストと画像を動画に適用
const applyOverlays = async () => {
  if (!trimmedVideoUrl.value || !ffmpeg.value || !isFFmpegLoaded.value) {
    alert('トリミングされた動画が見つかりません。まずトリミングを完了してください。')
    return
  }
  
  try {
    isApplyingOverlays.value = true
    console.log('[Overlay] Starting overlay application')
    
    // フォントファイルを読み込む（FFmpeg.wasmにはデフォルトフォントがないため必須）
    const fontURL = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf'
    const fontName = 'font.otf'
    console.log('[Overlay] Loading font...')
    try {
      await ffmpeg.value.writeFile(fontName, await fetchFile(fontURL))
      console.log('[Overlay] Font loaded successfully')
    } catch (fontError: any) {
      console.warn('[Overlay] Failed to load font from GitHub, trying alternative source...', fontError)
      // 代替フォントソースを試す（必要に応じて）
      throw new Error('フォントの読み込みに失敗しました。インターネット接続を確認してください。')
    }
    
    // トリミングされた動画を取得
    const trimmedBlob = await fetch(trimmedVideoUrl.value).then(r => r.blob())
    const trimmedFile = new File([trimmedBlob], 'trimmed.mp4', { type: 'video/mp4' })
    
    const inputFileName = 'input.mp4'
    const outputFileName = 'final.mp4'
    
    // 入力動画をFFmpegに書き込む
    await ffmpeg.value.writeFile(inputFileName, await fetchFile(trimmedFile))
    console.log('[Overlay] Input video written')
    
    // 画像ファイルをFFmpegに書き込む
    const imageFiles: string[] = []
    for (let i = 0; i < imageItems.value.length; i++) {
      const item = imageItems.value[i]
      if (item && item.file) {
        const fileExt = item.file.name.split('.').pop() || 'png'
        const imageFileName = `image${i}.${fileExt}`
        await ffmpeg.value.writeFile(imageFileName, await fetchFile(item.file))
        imageFiles.push(imageFileName)
        console.log('[Overlay] Image written:', imageFileName)
      }
    }
    
    // FFmpegフィルターを構築
    const textFilters: string[] = []
    const imageOverlays: Array<{ file: string; x: string; y: string; startTime: number; endTime: number }> = []
    
    // テキストオーバーレイを追加
    textItems.value.forEach((item) => {
      if (item.text.trim() !== '' && item.startTime >= 0 && item.endTime > item.startTime) {
        const escapedText = item.text.replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\[/g, '\\[').replace(/\]/g, '\\]')
        // フォントファイルを指定（FFmpeg.wasmにはデフォルトフォントがないため必須）
        // トリミング後プレビューと同じ見た目にするため、黒縁なし・シャドウのみ
        const textFilter =
          `drawtext=fontfile=${fontName}:` +
          `text='${escapedText}':` +
          `fontsize=24:` +
          `fontcolor=white:` +
          `shadowcolor=black@0.6:` +
          `shadowx=1:` +
          `shadowy=1:` +
          `x=(w-text_w)/2:` +
          `y=h-th-40:` +
          `enable='between(t,${item.startTime},${item.endTime})'`
        textFilters.push(textFilter)
      }
    })
    
    // 画像オーバーレイ情報を収集（画面を4分割した各エリアの中央に配置）
    imageItems.value.forEach((item, index) => {
      if (item.file && item.startTime >= 0 && item.endTime > item.startTime) {
        // FFmpegのoverlayでも同じ座標式を使用
        let x = 'W/4-w/2'
        let y = 'H/4-h/2'

        switch (item.position) {
          case 'top-left':
            x = 'W/4-w/2'
            y = 'H/4-h/2'
            break
          case 'top-right':
            x = '3*W/4-w/2'
            y = 'H/4-h/2'
            break
          case 'bottom-left':
            x = 'W/4-w/2'
            y = '3*H/4-h/2'
            break
          case 'bottom-right':
            x = '3*W/4-w/2'
            y = '3*H/4-h/2'
            break
        }

        const imageFile = imageFiles[index]
        if (imageFile) {
          imageOverlays.push({
            file: imageFile,
            x,
            y,
            startTime: item.startTime,
            endTime: item.endTime
          })
        }
      }
    })
    
    // フィルターコンプレックスを構築
    let filterComplex = ''
    let currentVideoLabel = '[0:v]'
    let step = 1
    let finalOutputLabel = ''
    
    // テキストフィルターを適用
    if (textFilters.length > 0) {
      const textFilterChain = textFilters.join(',')
      // フィルターチェーンを構築（カンマで連結）
      filterComplex = `${currentVideoLabel}${textFilterChain}[v${step}]`
      currentVideoLabel = `[v${step}]`
      finalOutputLabel = `v${step}`
      step++
    }
    
    // 画像オーバーレイを適用
    imageOverlays.forEach((overlay, index) => {
      const inputIndex = index + 1
      // overlayフィルターの構文を修正（入力ラベルを正しく指定）
      const overlayFilter = `${currentVideoLabel}[${inputIndex}:v]overlay=${overlay.x}:${overlay.y}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${step}]`
      if (filterComplex) {
        filterComplex += `;${overlayFilter}`
      } else {
        filterComplex = overlayFilter
      }
      currentVideoLabel = `[v${step}]`
      finalOutputLabel = `v${step}`
      step++
    })
    
    // 最終的な出力ラベルが設定されていない場合（フィルターがない場合）
    if (!finalOutputLabel && filterComplex) {
      // フィルターコンプレックスの最後の出力ラベルを抽出
      const match = filterComplex.match(/\[([^\]]+)\]$/)
      if (match && match[1]) {
        finalOutputLabel = match[1]
      }
    }
    
    // 最終的な出力ラベルが設定されていない場合はエラー
    if (filterComplex && !finalOutputLabel) {
      throw new Error('Failed to determine output label from filter complex')
    }
    
    // FFmpegコマンドを構築
    const command: string[] = ['-i', inputFileName]
    
    // 画像入力を追加
    imageFiles.forEach(file => {
      command.push('-i', file)
    })
    
    // フィルターを適用
    if (filterComplex && finalOutputLabel) {
      // フィルターコンプレックスを追加
      command.push('-filter_complex', filterComplex)
      // フィルターコンプレックスの出力をマップ（標準的な書き方）
      command.push('-map', `[${finalOutputLabel}]`)
      // オーディオストリームをマップ（存在する場合）
      command.push('-map', '0:a?')
      command.push('-c:a', 'copy')
      command.push('-c:v', 'libx264')
      command.push('-preset', 'fast')
      command.push('-crf', '28') // 画質調整（軽くする）
      command.push('-movflags', '+faststart') // Web再生を最適化
      command.push('-y') // 出力ファイルを上書き
      command.push(outputFileName)
    } else {
      // フィルターがない場合はそのままコピー
      command.push('-c', 'copy')
      command.push('-y') // 出力ファイルを上書き
      command.push(outputFileName)
    }
    
    console.log('[Overlay] Executing FFmpeg command:', command.join(' '))
    console.log('[Overlay] Filter complex:', filterComplex)
    console.log('[Overlay] Final output label:', finalOutputLabel)
    console.log('[Overlay] Full command array:', command)
    
    // FFmpegの実行
    try {
      console.log('[Overlay] Starting FFmpeg execution...')
      console.log('[Overlay] Command:', command.join(' '))
      
      // FFmpegの実行（エラーをキャッチして詳細を表示）
      try {
        console.log('[Overlay] Executing FFmpeg with command:', command.join(' '))
        console.log('[Overlay] Waiting for FFmpeg to complete...')
        
        // FFmpegの実行前にログハンドラーを再設定（確実にログを取得するため）
        // 既存のログハンドラーを削除してから新しいものを設定
        try {
          // すべてのログを確実にキャプチャするため、複数の方法を試す
          const logHandler = (event: any) => {
            // eventがオブジェクトの場合と文字列の場合の両方に対応
            if (typeof event === 'string') {
              console.log('[FFmpeg]', event)
            } else if (event && typeof event === 'object') {
              const type = event.type || 'info'
              const message = event.message || String(event)
              const prefix = type === 'fferr' ? '[FFmpeg ERROR]' : type === 'ffout' ? '[FFmpeg OUTPUT]' : '[FFmpeg INFO]'
              console.log(prefix, message)
            } else {
              console.log('[FFmpeg]', event)
            }
          }
          ffmpeg.value.on('log', logHandler)
          console.log('[Overlay] Log handler set up for execution')
        } catch (logSetupError) {
          console.warn('[Overlay] Could not set up log handler:', logSetupError)
        }
        
        // FFmpegの実行をPromiseでラップして、エラーを詳細にキャプチャ
        try {
          console.log('[Overlay] About to execute FFmpeg command')
          console.log('[Overlay] Full command:', JSON.stringify(command, null, 2))
          
          const execPromise = ffmpeg.value.exec(command)
          const result = await execPromise
          console.log('[Overlay] FFmpeg command completed, exit code:', result)
          
          // 終了コードが0でない場合はエラー
          if (result !== 0) {
            console.error('[Overlay] FFmpeg exited with non-zero code:', result)
            // ファイルシステムを確認して、エラーの詳細を取得
            const filesAfterExec = await ffmpeg.value.listDir('/')
            const fileNamesAfterExec = filesAfterExec.map((f: any) => typeof f === 'string' ? f : (f.name || f))
            console.error('[Overlay] Files after exec:', fileNamesAfterExec)
            throw new Error(`FFmpeg exited with code ${result}. Output file "${outputFileName}" was not created. Available files: ${fileNamesAfterExec.join(', ')}`)
          }
          
          // 実行が成功した場合でも、出力ファイルが存在するか確認
          // FFmpeg.wasmでは、エラーが発生しても例外を投げない可能性がある
          const filesAfterExec = await ffmpeg.value.listDir('/')
          const fileNamesAfterExec = filesAfterExec.map((f: any) => typeof f === 'string' ? f : (f.name || f))
          console.log('[Overlay] Files after exec:', fileNamesAfterExec)
          
          if (!fileNamesAfterExec.includes(outputFileName)) {
            console.warn('[Overlay] Output file not found after exec, FFmpeg may have failed silently')
            throw new Error(`FFmpeg completed but output file "${outputFileName}" was not created. Available files: ${fileNamesAfterExec.join(', ')}`)
          }
        } catch (execError: any) {
          // エラーを詳細にログ出力
          console.error('[Overlay] FFmpeg exec error caught:', execError)
          console.error('[Overlay] Error type:', typeof execError)
          console.error('[Overlay] Error message:', execError?.message)
          console.error('[Overlay] Error name:', execError?.name)
          console.error('[Overlay] Error stack:', execError?.stack)
          // エラーを再スローして、外側のcatchブロックで処理
          throw execError
        }
      } catch (execError: any) {
        console.error('[Overlay] FFmpeg exec failed:', execError)
        console.error('[Overlay] Exec error details:', {
          message: execError?.message,
          name: execError?.name,
          stack: execError?.stack
        })
        // エラーが発生した場合は、そのままエラーを投げる
        throw new Error(`FFmpeg execution failed: ${execError?.message || 'Unknown error'}`)
      }
      
      // FFmpegがファイルを書き込む時間を確保
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // ファイルシステムを確認
      const files = await ffmpeg.value.listDir('/')
      const fileNames = files.map((f: any) => typeof f === 'string' ? f : (f.name || f))
      console.log('[Overlay] Files after execution:', fileNames)
      
      // 出力ファイルが存在するか確認
      const outputExists = fileNames.includes(outputFileName)
      
      if (!outputExists) {
        console.warn('[Overlay] Output file not found, checking for any output files...')
        // すべてのファイルを確認
        const mp4Files = fileNames.filter((fileName: string) => 
          fileName.endsWith('.mp4') && fileName !== inputFileName
        )
        console.log('[Overlay] Found MP4 files:', mp4Files)
        
        // エラーメッセージを詳細に
        throw new Error(`Output file "${outputFileName}" was not created by FFmpeg. Available files: ${fileNames.join(', ')}`)
      }
    } catch (execError: any) {
      console.error('[Overlay] FFmpeg execution error:', execError)
      throw execError
    }
    
    // 少し待ってからファイルシステムを確認（FFmpegがファイルを書き込む時間を確保）
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 出力ファイルが存在するか確認
    let data: Uint8Array | null = null
    try {
      const files = await ffmpeg.value.listDir('/')
      console.log('[Overlay] Files in FFmpeg FS:', files.map((f: any) => f.name || f))
      
      // 出力ファイルが存在するか確認
      const fileExists = files.some((f: any) => {
        const fileName = typeof f === 'string' ? f : (f.name || f)
        return fileName === outputFileName
      })
      
      if (fileExists) {
        console.log('[Overlay] Output file found, reading...')
        const fileData = await ffmpeg.value.readFile(outputFileName)
        data = fileData instanceof Uint8Array ? fileData : (typeof fileData === 'string' ? new TextEncoder().encode(fileData) : new Uint8Array(fileData as unknown as ArrayBuffer))
      } else {
        console.warn('[Overlay] Output file not found in FS, checking for any .mp4 files...')
        // すべての.mp4ファイルを探す
        for (const f of files) {
          const fileName = typeof f === 'string' ? f : (typeof f === 'object' && 'name' in f ? String(f.name) : String(f))
          if (typeof fileName === 'string' && fileName.endsWith('.mp4') && fileName !== inputFileName) {
            console.log('[Overlay] Found MP4 file:', fileName)
            try {
              const fileData = await ffmpeg.value.readFile(fileName)
              data = fileData instanceof Uint8Array ? fileData : (typeof fileData === 'string' ? new TextEncoder().encode(fileData) : new Uint8Array(fileData as unknown as ArrayBuffer))
              console.log('[Overlay] Successfully read file:', fileName)
              break
            } catch (readError) {
              console.warn('[Overlay] Failed to read file:', fileName, readError)
            }
          }
        }
        
        if (!data) {
          throw new Error('Output file not found in FFmpeg file system. FFmpeg command may have failed silently.')
        }
      }
    } catch (listError: any) {
      console.warn('[Overlay] Error checking files:', listError)
      // 直接読み込みを試行
      try {
        console.log('[Overlay] Attempting direct read of:', outputFileName)
        const fileData = await ffmpeg.value.readFile(outputFileName)
        data = fileData instanceof Uint8Array ? fileData : (typeof fileData === 'string' ? new TextEncoder().encode(fileData) : new Uint8Array(fileData as unknown as ArrayBuffer))
      } catch (directError: any) {
        console.error('[Overlay] Direct read also failed:', directError)
        throw new Error(`Failed to read output file: ${directError?.message || listError?.message || 'Unknown error'}`)
      }
    }
    
    if (!data) {
      throw new Error('Failed to read output file: No data available')
    }
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
    finalVideoUrl.value = URL.createObjectURL(blob)
    console.log('[Overlay] Final video created, size:', blob.size)
    
    // 一時ファイルを削除
    try {
      await ffmpeg.value.deleteFile(inputFileName)
      await ffmpeg.value.deleteFile(outputFileName)
      for (const imageFile of imageFiles) {
        await ffmpeg.value.deleteFile(imageFile)
      }
    } catch (cleanupError) {
      console.warn('[Overlay] Cleanup error (non-critical):', cleanupError)
    }
    
    alert('テキストと画像の適用が完了しました')
  } catch (error: any) {
    console.error('[Overlay] Error applying overlays:', error)
    console.error('[Overlay] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack
    })
    alert('テキストと画像の適用中にエラーが発生しました。\n\nブラウザのコンソール（F12キー）で詳細なエラーを確認できます。')
  } finally {
    isApplyingOverlays.value = false
  }
}

// トリミングが完了しているかチェック
const isTrimmed = computed(() => {
  return trimmedVideoUrl.value !== null && startTime.value >= 0 && endTime.value > startTime.value
})

// トリミングを実行できるかチェック
const canTrim = computed(() => {
  return videoUrl.value !== null && 
         videoFile.value !== null && 
         ffmpeg.value !== null && 
         isFFmpegLoaded.value &&
         startTime.value >= 0 && 
         startTime.value < endTime.value &&
         endTime.value <= videoDuration.value &&
         !isTrimming.value &&
         !isFFmpegLoading.value
})
</script>

<template>
  <div class="app-container">
    <!-- 左サイドバー（アイコン） -->
    <div class="sidebar">
      <button 
        class="sidebar-icon" 
        :class="{ active: activePanel === 'text' }"
        @click="togglePanel('text')"
        title="テキスト挿入"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 20h16M6 4v16M18 4v16M6 4h12M6 20h12"/>
        </svg>
      </button>
      <button 
        class="sidebar-icon" 
        :class="{ active: activePanel === 'image' }"
        @click="togglePanel('image')"
        title="画像挿入"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </button>
    </div>

    <!-- テキスト挿入パネル -->
    <div class="panel" :class="{ active: activePanel === 'text' }">
      <div class="panel-header">
        <h2>テキストを挿入</h2>
        <button class="close-btn" @click="togglePanel('text')">×</button>
      </div>
      <div class="panel-content">
        <button class="ai-transcribe-btn" @click="transcribeAudio">
          AI文字起こし
        </button>
        
        <div v-for="(item, index) in textItems" :key="item.id" class="text-item">
          <div class="text-item-header">
            <span>テキスト{{ index + 1 }}</span>
            <button class="remove-btn" @click="removeTextItem(item.id)">削除</button>
          </div>
          <input 
            v-model="item.text" 
            type="text" 
            :placeholder="`テキスト${index + 1}`"
            class="text-input"
          />
          <div class="time-inputs">
            <div class="time-input-group">
              <label>開始</label>
              <input 
                v-model.number="item.startTime" 
                type="number" 
                step="0.1" 
                min="0"
                :max="videoDuration"
              />
            </div>
            <div class="time-input-group">
              <label>終了</label>
              <input 
                v-model.number="item.endTime" 
                type="number" 
                step="0.1" 
                min="0"
                :max="videoDuration"
              />
            </div>
          </div>
          <button v-if="index < textItems.length - 1" class="add-separator">+</button>
        </div>
        
        <button class="add-btn" @click="addTextItem">
          + テキストを追加
        </button>
      </div>
    </div>

    <!-- 画像挿入パネル -->
    <div class="panel" :class="{ active: activePanel === 'image' }">
      <div class="panel-header">
        <h2>画像を挿入</h2>
        <button class="close-btn" @click="togglePanel('image')">×</button>
      </div>
      <div class="panel-content">
        <div v-for="(item, index) in imageItems" :key="item.id" class="image-item">
          <div class="image-item-header">
            <span>画像{{ index + 1 }}</span>
            <button class="remove-btn" @click="removeImageItem(item.id)">削除</button>
          </div>
          <div class="image-position-select">
            <label>画像位置</label>
            <select v-model="item.position">
              <option value="top-left">左上</option>
              <option value="top-right">右上</option>
              <option value="bottom-left">左下</option>
              <option value="bottom-right">右下</option>
            </select>
          </div>
          <div class="time-inputs">
            <div class="time-input-group">
              <label>開始</label>
              <input 
                v-model.number="item.startTime" 
                type="number" 
                step="0.1" 
                min="0"
                :max="videoDuration"
              />
            </div>
            <div class="time-input-group">
              <label>終了</label>
              <input 
                v-model.number="item.endTime" 
                type="number" 
                step="0.1" 
                min="0"
                :max="videoDuration"
              />
            </div>
          </div>
          <div class="image-upload-area">
            <input 
              type="file" 
              accept="image/*" 
              @change="handleImageUpload($event, item.id)"
              class="image-input"
              :id="`image-input-${item.id}`"
            />
            <label :for="`image-input-${item.id}`" class="image-upload-label">
              <span v-if="!item.url">+ 画像をアップロード</span>
              <img v-else :src="item.url" alt="Uploaded image" class="uploaded-image-preview" />
            </label>
          </div>
          <hr v-if="index < imageItems.length - 1" class="separator" />
        </div>
        
        <button class="add-btn" @click="addImageItem">
          + 画像を追加
        </button>
      </div>
    </div>

    <!-- メインコンテンツエリア -->
    <div class="main-content">
      <div class="video-section">
        <h1 class="app-title">マナベル</h1>
        
        <div class="video-upload-area">
          <input 
            type="file" 
            accept="video/*" 
            @change="handleVideoUpload"
            class="video-input"
            id="video-input"
          />
          <!-- 動画がまだ選択されていないとき：アップロード用ラベルを表示 -->
          <label v-if="!videoUrl" for="video-input" class="video-upload-label">
            <span>+ 動画をアップロード</span>
          </label>

          <!-- 動画があるとき：折りたたみ可能なセクション -->
          <div v-else class="original-video-section">
            <div class="original-video-header" @click="isOriginalVideoCollapsed = !isOriginalVideoCollapsed">
              <h3>
                <span>トリミング前の動画</span>
                <svg 
                  class="collapse-icon" 
                  :class="{ collapsed: isOriginalVideoCollapsed }"
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </h3>
            </div>
            <div v-if="!isOriginalVideoCollapsed" class="video-preview-wrapper">
              <button
                class="video-close-btn"
                type="button"
                @click.stop.prevent="clearVideo"
              >
                ×
              </button>
              <video :src="videoUrl" controls class="video-preview"></video>
            </div>
          </div>
          <button class="media-select-btn" @click="openMediaLibrary">
            メディアから選択
          </button>
        </div>

        <!-- トリミング設定 -->
        <div v-if="videoUrl && !isOriginalVideoCollapsed" class="trim-section">
          <h3>動画のトリミング</h3>
          <div class="time-inputs">
            <div class="time-input-group">
              <label>開始</label>
              <input 
                v-model.number="startTime" 
                type="number" 
                step="0.1" 
                min="0"
                :max="videoDuration"
              />
              <span class="time-unit">秒</span>
            </div>
            <div class="time-input-group">
              <label>終了</label>
              <input 
                v-model.number="endTime" 
                type="number" 
                step="0.1" 
                min="0"
                :max="videoDuration"
              />
              <span class="time-unit">秒</span>
            </div>
            <button class="trim-btn" @click="applyTrim" :disabled="!canTrim">
              {{ isTrimming ? 'トリミング中...' : isFFmpegLoading ? '読み込み中...' : 'トリミングを適用' }}
            </button>
            <div v-if="isFFmpegLoading" class="loading-message">
              <p>動画編集エンジンを読み込んでいます...</p>
            </div>
            <div v-if="!ffmpeg && !isFFmpegLoading" class="error-message">
              <p><strong>動画編集エンジンの読み込みに失敗しました</strong></p>
              <p style="font-size: 12px; margin-top: 8px;">
                以下の方法をお試しください：<br>
                1. ページを再読み込み（F5キー）<br>
                2. インターネット接続を確認<br>
                3. ブラウザのコンソール（F12キー）でエラーを確認
              </p>
            </div>
          </div>
        </div>

        <!-- トリミング後の動画プレビュー -->
        <div v-if="trimmedVideoUrl" class="trimmed-video-preview">
          <h3>トリミング後の動画</h3>
          <div class="video-preview-wrapper">
            <button
              class="video-close-btn"
              type="button"
              @click.stop.prevent="clearTrimmedVideo"
            >
              ×
            </button>
            <video
              ref="trimmedVideoRef"
              :src="trimmedVideoUrl"
              controls
              class="video-preview"
              @timeupdate="handleTrimmedTimeUpdate"
            ></video>

            <!-- リアルタイムプレビュー用テキストオーバーレイ -->
            <div class="overlay-layer">
              <div
                v-for="item in activeTextOverlays"
                :key="`text-preview-${item.id}`"
                class="overlay-text"
              >
                {{ item.text }}
              </div>

              <!-- リアルタイムプレビュー用画像オーバーレイ -->
              <div
                v-for="item in activeImageOverlays"
                :key="`image-preview-${item.id}`"
                class="overlay-image"
                :style="getImageOverlayStyle(item.position)"
              >
                <img
                  v-if="item.url"
                  :src="item.url"
                  alt="overlay"
                />
              </div>
            </div>
          </div>
          
          <!-- テキストと画像を適用するボタン -->
          <div v-if="isTrimmed" class="apply-overlays-section">
            <button 
              class="apply-overlays-btn" 
              @click="applyOverlays" 
              :disabled="isApplyingOverlays || !isFFmpegLoaded"
            >
              {{ isApplyingOverlays ? '適用中...' : 'テキストと画像を適用' }}
            </button>
            <p v-if="textItems.length > 0 || imageItems.length > 0" class="overlay-info">
              テキスト: {{ textItems.filter(item => item.text.trim() !== '').length }}個、
              画像: {{ imageItems.filter(item => item.file !== null).length }}個
            </p>
          </div>
        </div>

        <!-- 最終的な動画プレビュー -->
        <div v-if="finalVideoUrl" class="final-video-preview">
          <h3>最終的な動画</h3>
          <div class="video-preview-wrapper">
            <button
              class="video-close-btn"
              type="button"
              @click.stop.prevent="clearFinalVideo"
            >
              ×
            </button>
            <video :src="finalVideoUrl" controls class="video-preview"></video>
          </div>
        </div>

        <!-- テキストと画像の挿入はトリミング後にのみ可能 -->
        <div v-if="!isTrimmed && videoUrl" class="info-message">
          <p>まず動画のトリミングを完了してください</p>
        </div>
      </div>
    </div>

    <!-- メディアライブラリモーダル -->
    <div v-if="showMediaLibrary" class="modal-overlay" @click="showMediaLibrary = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>メディアから選択</h2>
          <button class="close-btn" @click="showMediaLibrary = false">×</button>
        </div>
        <!-- メディア一覧（件数に応じて表示を切り替え） -->
        <div v-if="uploadedVideos.length > 0" class="media-grid">
          <div
            v-for="video in uploadedVideos"
            :key="video.id"
            class="media-item"
            @click="selectVideoFromLibrary(video)"
          >
            <div class="media-thumbnail">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <p class="media-name">{{ video.name }}</p>
          </div>
        </div>

        <!-- メディアが1件もない場合のメッセージ -->
        <div v-else class="no-media-message">
          過去のメディアがないため、動画をアップロードください。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* サイドバー */
.sidebar {
  width: 60px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 20px;
  z-index: 100;
}

.sidebar-icon {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #666;
  transition: all 0.2s;
}

.sidebar-icon:hover {
  background: #f0f0f0;
  color: #9333ea;
}

.sidebar-icon.active {
  background: #9333ea;
  color: white;
}

/* パネル */
.panel {
  position: fixed;
  left: 60px;
  top: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 90;
  overflow-y: auto;
}

.panel.active {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.panel-content {
  padding: 20px;
}

/* AI文字起こしボタン */
.ai-transcribe-btn {
  width: 100%;
  padding: 12px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background 0.2s;
}

.ai-transcribe-btn:hover {
  background: #7e22ce;
}

/* テキストアイテム */
.text-item {
  margin-bottom: 20px;
}

.text-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.text-item-header span {
  font-weight: 600;
  color: #333;
}

.remove-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #fecaca;
}

.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.time-inputs {
  display: flex;
  gap: 10px;
}

.time-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.time-input-group label {
  font-size: 12px;
  color: #666;
}

.time-input-group input {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.add-separator {
  width: 100%;
  text-align: center;
  background: none;
  border: none;
  color: #9333ea;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  margin: 10px 0;
}

/* 画像アイテム */
.image-item {
  margin-bottom: 20px;
}

.image-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.image-item-header span {
  font-weight: 600;
  color: #333;
}

.image-position-select {
  margin-bottom: 10px;
}

.image-position-select label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.image-position-select select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.image-upload-area {
  margin-top: 10px;
}

.image-input {
  display: none;
}

.image-upload-label {
  display: block;
  width: 100%;
  min-height: 150px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-upload-label:hover {
  border-color: #9333ea;
}

.image-upload-label span {
  color: #666;
  font-size: 14px;
}

.uploaded-image-preview {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.separator {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
}

.add-btn {
  width: 100%;
  padding: 12px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #7e22ce;
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.app-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 30px;
  text-align: right;
}

.video-section {
  max-width: 1200px;
  margin: 0 auto;
}

.video-upload-area {
  position: relative;
  margin-bottom: 30px;
}

.video-input {
  display: none;
}

.video-upload-label {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  background: white;
}

.video-upload-label:hover {
  border-color: #9333ea;
}

.video-upload-label span {
  color: #666;
  font-size: 16px;
}

.video-preview-wrapper {
  position: relative;
  width: 100%;
}

.video-close-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  z-index: 10;            /* 動画より前面に出す */
  pointer-events: auto;   /* クリックを必ず受け取る */
}

.video-close-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.video-preview {
  width: 100%;
  max-height: 600px;
  border-radius: 12px;
}

/* 元動画セクション */
.original-video-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.original-video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-bottom: 15px;
}

.original-video-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-icon {
  transition: transform 0.3s ease;
  color: #666;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.original-video-section .video-preview-wrapper {
  margin-top: 0;
}

/* トリミング後プレビュー用オーバーレイ */
.overlay-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.overlay-text {
  position: absolute;
  left: 50%;
  bottom: 30px; /* FFmpegのy=h-th-40に近づけるため微調整 */
  transform: translateX(-50%);
  color: #fff;
  font-size: 24px;              /* drawtextのfontsize=24に合わせる */
  max-width: 80%;
  text-align: center;
  word-break: break-word;
  font-weight: normal;          /* FFmpeg側と統一（デフォルトの太さ） */
  /* FFmpeg側と同じシャドウ設定（shadowx=1, shadowy=1, shadowcolor=black@0.6） */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.overlay-image {
  position: absolute;
}

.overlay-image img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.media-select-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.media-select-btn:hover {
  background: #7e22ce;
}

.trim-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.trim-section h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.trim-section .time-inputs {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.trim-section .time-input-group {
  flex: 1;
}

.trim-section .time-unit {
  margin-left: 5px;
  color: #666;
  font-size: 14px;
}

.trim-btn {
  padding: 10px 24px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.trim-btn:hover:not(:disabled) {
  background: #7e22ce;
}

.trim-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.trimmed-video-preview {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.trimmed-video-preview h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.apply-overlays-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.apply-overlays-btn {
  width: 100%;
  padding: 12px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-overlays-btn:hover:not(:disabled) {
  background: #7e22ce;
}

.apply-overlays-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.overlay-info {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.final-video-preview {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 2px solid #9333ea;
}

.final-video-preview h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #9333ea;
}

.info-message {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  padding: 15px;
  border-radius: 8px;
  color: #92400e;
  text-align: center;
}

.loading-message {
  margin-top: 10px;
  padding: 10px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  color: #1e40af;
  font-size: 14px;
}

.loading-message p {
  margin: 0;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 6px;
  color: #991b1b;
  font-size: 14px;
}

.error-message p {
  margin: 0;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.media-item {
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.2s;
}

.media-item:hover {
  border-color: #9333ea;
}

.media-thumbnail {
  width: 100%;
  height: 120px;
  background: #f5f5f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  margin-bottom: 10px;
}

.media-name {
  margin: 0;
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

/* メディアがない場合のメッセージ */
.no-media-message {
  padding: 40px 20px;
  text-align: center;
  font-size: 14px;
  color: #555;
  background: #f9fafb;
  border-radius: 8px;
}
</style>
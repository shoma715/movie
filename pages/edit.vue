<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントを直接作成（SPAモード用）
const config = useRuntimeConfig()
const supabaseUrl = config.public?.supabase?.url || ''
const supabaseKey = config.public?.supabase?.key || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// FFmpeg関連
const ffmpeg = ref<FFmpeg | null>(null)
const isFFmpegLoading = ref(false)
const isFFmpegLoaded = ref(false)
const isTrimming = ref(false)
const isApplyingOverlays = ref(false)
const finalVideoUrl = ref<string | null>(null)

// カットの型定義
type Cut = {
  id: number
  name: string
  videoFile: File | null
  videoUrl: string | null
  videoDuration: number
  startTime: number
  endTime: number
  trimmedVideoUrl: string | null
  finalVideoUrl: string | null
  textItems: Array<{ id: number; text: string; startTime: number; endTime: number }>
  imageItems: Array<{ id: number; file: File | null; url: string | null; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; startTime: number; endTime: number }>
  isCollapsed: boolean
}

// カットリスト
const cuts = ref<Cut[]>([])
let cutIdCounter = 0
let textItemIdCounter = 0
let imageItemIdCounter = 0

// 初期カットを追加
const initializeDefaultCut = () => {
  if (cuts.value.length === 0) {
    const defaultCut: Cut = {
      id: cutIdCounter++,
      name: 'カット1',
      videoFile: null,
      videoUrl: null,
      videoDuration: 0,
      startTime: 0,
      endTime: 0,
      trimmedVideoUrl: null,
      finalVideoUrl: null,
      textItems: [],
      imageItems: [],
      isCollapsed: false
    }
    cuts.value.push(defaultCut)
    activeCutId.value = defaultCut.id
  }
}

// 現在選択中のカットID
const activeCutId = ref<number | null>(null)

// 編集中のカットID
const editingCutId = ref<number | null>(null)

// ドラッグ&ドロップ関連
const draggedCutId = ref<number | null>(null)
const dragOverCutId = ref<number | null>(null)

// テキストアイテムのドラッグ&ドロップ関連
const draggedTextItemId = ref<number | null>(null)
const dragOverTextItemId = ref<number | null>(null)

// 動画タイトル
const videoTitle = ref<string>('')

// 完成動画の生成中状態
const isCompleting = ref(false)

// 現在選択中のカットを取得
const activeCut = computed(() => {
  if (activeCutId.value === null) return null
  return cuts.value.find(c => c.id === activeCutId.value) || null
})

// 動画関連の状態（現在選択中のカットから取得）
const videoFile = computed({
  get: () => activeCut.value?.videoFile || null,
  set: (val) => {
    if (activeCut.value) activeCut.value.videoFile = val
  }
})
const videoUrl = computed({
  get: () => activeCut.value?.videoUrl || null,
  set: (val) => {
    if (activeCut.value) activeCut.value.videoUrl = val
  }
})
const videoDuration = computed({
  get: () => activeCut.value?.videoDuration || 0,
  set: (val) => {
    if (activeCut.value) activeCut.value.videoDuration = val
  }
})
const startTime = computed({
  get: () => activeCut.value?.startTime || 0,
  set: (val) => {
    if (activeCut.value) activeCut.value.startTime = val
  }
})
const endTime = computed({
  get: () => activeCut.value?.endTime || 0,
  set: (val) => {
    if (activeCut.value) activeCut.value.endTime = val
  }
})
const trimmedVideoUrl = computed({
  get: () => activeCut.value?.trimmedVideoUrl || null,
  set: (val) => {
    if (activeCut.value) activeCut.value.trimmedVideoUrl = val
  }
})
const isOriginalVideoCollapsed = computed({
  get: () => activeCut.value?.isCollapsed || false,
  set: (val) => {
    if (activeCut.value) activeCut.value.isCollapsed = val
  }
})

// パネルの表示状態
const activePanel = ref<'text' | 'image' | null>(null)

// テキストサイズ（全テキストに適用）
type TextSize = 'small' | 'medium' | 'large'
const textSize = ref<TextSize>('medium')

// テキスト挿入関連（現在選択中のカットから取得）
const textItems = computed({
  get: () => activeCut.value?.textItems || [],
  set: (val) => {
    if (activeCut.value) activeCut.value.textItems = val
  }
})

// 画像挿入関連（現在選択中のカットから取得）
const imageItems = computed({
  get: () => activeCut.value?.imageItems || [],
  set: (val) => {
    if (activeCut.value) activeCut.value.imageItems = val
  }
})

// メディアライブラリ関連
const showMediaLibrary = ref(false)
const uploadedVideos = ref<Array<{ id: string; url: string; name: string }>>([])
const isLoadingMediaLibrary = ref(false)
const mediaLibraryError = ref<string | null>(null)

// プレビュー用（トリミング後動画の現在時間）
const trimmedVideoCurrentTime = ref(0)

// トリミング後動画プレイヤーの参照
const trimmedVideoRef = ref<HTMLVideoElement | null>(null)

// 動画のサイズ（幅と高さ）
const videoWidth = ref<number>(1920) // デフォルト値
const videoHeight = ref<number>(1080) // デフォルト値

// カットの追加
const addCut = () => {
  const newCut: Cut = {
    id: cutIdCounter++,
    name: `カット${cuts.value.length + 1}`,
    videoFile: null,
    videoUrl: null,
    videoDuration: 0,
    startTime: 0,
    endTime: 0,
    trimmedVideoUrl: null,
    finalVideoUrl: null,
    textItems: [],
    imageItems: [],
    isCollapsed: false
  }
  cuts.value.push(newCut)
  activeCutId.value = newCut.id
}

// カットの削除
const removeCut = (cutId: number) => {
  if (cuts.value.length <= 1) {
    alert('カットが1つしかない場合は削除できません')
    return
  }
  
  const index = cuts.value.findIndex(c => c.id === cutId)
  if (index !== -1) {
    const cut = cuts.value[index]
    // URLを解放
    if (cut.videoUrl && cut.videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cut.videoUrl)
    }
    if (cut.trimmedVideoUrl) {
      URL.revokeObjectURL(cut.trimmedVideoUrl)
    }
    if (cut.finalVideoUrl) {
      URL.revokeObjectURL(cut.finalVideoUrl)
    }
    cuts.value.splice(index, 1)
    
    // 削除されたカットが選択中だった場合、別のカットを選択
    if (activeCutId.value === cutId) {
      activeCutId.value = cuts.value.length > 0 ? cuts.value[0].id : null
    }
  }
}

// カットの選択
const selectCut = (cutId: number) => {
  activeCutId.value = cutId
}

// カット名の変更
const renameCut = (cutId: number, newName: string) => {
  const cut = cuts.value.find(c => c.id === cutId)
  if (cut) {
    cut.name = newName.trim() || `カット${cuts.value.indexOf(cut) + 1}`
  }
}

// カット名の編集を開始
const startEditingCutName = (cutId: number, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  editingCutId.value = cutId
  // 次のティックでフォーカスを設定
  nextTick(() => {
    const input = document.querySelector(`.tab.editing .tab-name-input`) as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

// カット名の編集を終了
const finishEditingCutName = (cutId: number, newName: string) => {
  renameCut(cutId, newName)
  editingCutId.value = null
}

// カット名の編集をキャンセル
const cancelEditingCutName = () => {
  editingCutId.value = null
}

// ドラッグ開始
const handleDragStart = (cutId: number, event: DragEvent) => {
  if (editingCutId.value === cutId) {
    event.preventDefault()
    return
  }
  draggedCutId.value = cutId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', '')
  }
}

// ドラッグオーバー
const handleDragOver = (cutId: number, event: DragEvent) => {
  if (draggedCutId.value === null || draggedCutId.value === cutId) {
    return
  }
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverCutId.value = cutId
}

// ドラッグリーブ
const handleDragLeave = () => {
  dragOverCutId.value = null
}

// ドロップ
const handleDrop = (cutId: number, event: DragEvent) => {
  event.preventDefault()
  if (draggedCutId.value === null || draggedCutId.value === cutId) {
    draggedCutId.value = null
    dragOverCutId.value = null
    return
  }
  
  const draggedIndex = cuts.value.findIndex(c => c.id === draggedCutId.value)
  const dropIndex = cuts.value.findIndex(c => c.id === cutId)
  
  if (draggedIndex !== -1 && dropIndex !== -1) {
    // カットの順番を変更
    const [draggedCut] = cuts.value.splice(draggedIndex, 1)
    cuts.value.splice(dropIndex, 0, draggedCut)
  }
  
  draggedCutId.value = null
  dragOverCutId.value = null
}

// ドラッグ終了
const handleDragEnd = () => {
  draggedCutId.value = null
  dragOverCutId.value = null
}

// 元動画のリセット
const clearVideo = () => {
  console.log('[Video] clearVideo called')
  const cut = activeCut.value
  if (!cut) return

  // 動画関連の状態をすべてリセット
  cut.videoFile = null
  cut.videoUrl = null
  cut.trimmedVideoUrl = null
  cut.finalVideoUrl = null
  cut.videoDuration = 0
  cut.startTime = 0
  cut.endTime = 0

  // テキスト・画像オーバーレイもクリア
  cut.textItems = []
  cut.imageItems = []

  // ファイル入力の値もクリア（同じファイルを再選択できるようにする）
  const inputEl = document.getElementById('video-input') as HTMLInputElement | null
  if (inputEl) {
    inputEl.value = ''
  }
}

// トリミング後動画のみリセット
const clearTrimmedVideo = () => {
  console.log('[Video] clearTrimmedVideo called')
  const cut = activeCut.value
  if (!cut) return
  cut.trimmedVideoUrl = null
  cut.finalVideoUrl = null
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
  
  // 動画のサイズを取得
  if (video.videoWidth && video.videoHeight) {
    videoWidth.value = video.videoWidth
    videoHeight.value = video.videoHeight
  }
}

// 動画のメタデータ読み込み時にサイズを取得
const handleVideoLoadedMetadata = (event: Event) => {
  const video = event.target as HTMLVideoElement
  if (video.videoWidth && video.videoHeight) {
    videoWidth.value = video.videoWidth
    videoHeight.value = video.videoHeight
  }
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

// 画像のサイズを計算（動画サイズの1/2を最大値として、アスペクト比を維持）
const calculateImageSize = (imageWidth: number, imageHeight: number) => {
  const maxWidth = videoWidth.value / 2
  const maxHeight = videoHeight.value / 2
  
  // アスペクト比を計算
  const aspectRatio = imageWidth / imageHeight
  
  let finalWidth = imageWidth
  let finalHeight = imageHeight
  
  // 最大サイズを超える場合、アスペクト比を維持してリサイズ
  if (imageWidth > maxWidth || imageHeight > maxHeight) {
    const widthRatio = maxWidth / imageWidth
    const heightRatio = maxHeight / imageHeight
    const ratio = Math.min(widthRatio, heightRatio)
    
    finalWidth = imageWidth * ratio
    finalHeight = imageHeight * ratio
  }
  
  return { width: finalWidth, height: finalHeight }
}

// 画像サイズを保存するためのref
const imageSizes = ref<Map<number, { width: number; height: number }>>(new Map())

// 画像のサイズを更新
const updateImageSize = (img: HTMLImageElement, itemId: number) => {
  if (img.naturalWidth && img.naturalHeight) {
    // 元の画像サイズを保存（動画サイズに基づいて計算するため）
    imageSizes.value.set(itemId, {
      width: img.naturalWidth,
      height: img.naturalHeight
    })
  }
}

// 画像オーバーレイの位置スタイルを返す（computedでリアクティブに更新）
const getImageOverlayStyle = (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', itemId: number, imageUrl?: string | null) => {
  // 動画のサイズを取得（プレビュー用）
  const video = trimmedVideoRef.value
  let vWidth = videoWidth.value
  let vHeight = videoHeight.value
  
  if (video && video.videoWidth && video.videoHeight) {
    vWidth = video.videoWidth
    vHeight = video.videoHeight
  }
  
  // 画像のサイズを取得
  let imgWidth = 200 // デフォルト値
  let imgHeight = 200 // デフォルト値
  
  // 既に読み込まれている画像のサイズを使用
  if (imageSizes.value.has(itemId)) {
    const size = imageSizes.value.get(itemId)!
    imgWidth = size.width
    imgHeight = size.height
  } else if (imageUrl) {
    // 画像がまだ読み込まれていない場合、デフォルト値を使用
    // 実際のサイズはupdateImageSizeで更新される
  }
  
  // 動画サイズの1/2を最大値として計算
  const maxWidth = vWidth / 2
  const maxHeight = vHeight / 2
  
  // アスペクト比を維持してリサイズ
  let finalWidth = imgWidth
  let finalHeight = imgHeight
  
  // 動画サイズの1/2を超えないようにリサイズ（アスペクト比を維持）
  const widthRatio = maxWidth / imgWidth
  const heightRatio = maxHeight / imgHeight
  const ratio = Math.min(widthRatio, heightRatio)
  
  finalWidth = imgWidth * ratio
  finalHeight = imgHeight * ratio
  
  // 最終的な保証（確実に1/2以下にする）
  finalWidth = Math.min(finalWidth, maxWidth)
  finalHeight = Math.min(finalHeight, maxHeight)
  
  // プレビュー用のサイズ（動画要素の実際の表示サイズに合わせる）
  const videoElement = trimmedVideoRef.value
  let scaleX = 1
  let scaleY = 1
  
  if (videoElement) {
    const rect = videoElement.getBoundingClientRect()
    if (videoElement.videoWidth && videoElement.videoHeight) {
      scaleX = rect.width / videoElement.videoWidth
      scaleY = rect.height / videoElement.videoHeight
    }
  }
  
  const displayWidth = finalWidth * scaleX
  const displayHeight = finalHeight * scaleY
  
  // 画像が動画の高さを超えないようにする（動画要素の実際の表示高さに合わせる）
  const videoDisplayHeight = videoElement ? videoElement.getBoundingClientRect().height : vHeight * scaleY
  const maxDisplayHeight = videoDisplayHeight
  let adjustedDisplayHeight = Math.min(displayHeight, maxDisplayHeight)
  let adjustedDisplayWidth = displayWidth * (adjustedDisplayHeight / displayHeight)
  
  // 横幅も動画の幅の1/2を超えないようにする
  const videoDisplayWidth = videoElement ? videoElement.getBoundingClientRect().width : vWidth * scaleX
  const maxDisplayWidth = videoDisplayWidth / 2
  if (adjustedDisplayWidth > maxDisplayWidth) {
    const widthRatio = maxDisplayWidth / adjustedDisplayWidth
    adjustedDisplayWidth = adjustedDisplayWidth * widthRatio
    adjustedDisplayHeight = adjustedDisplayHeight * widthRatio
  }
  
  // 縦幅も動画の高さの1/2を超えないようにする
  const maxDisplayHeightLimit = videoDisplayHeight / 2
  if (adjustedDisplayHeight > maxDisplayHeightLimit) {
    const heightRatio = maxDisplayHeightLimit / adjustedDisplayHeight
    adjustedDisplayWidth = adjustedDisplayWidth * heightRatio
    adjustedDisplayHeight = adjustedDisplayHeight * heightRatio
  }
  
  // 画像が動画の高さを超えないようにする（確実に動画内に収める）
  if (adjustedDisplayHeight > videoDisplayHeight) {
    const heightRatio = videoDisplayHeight / adjustedDisplayHeight
    adjustedDisplayWidth = adjustedDisplayWidth * heightRatio
    adjustedDisplayHeight = videoDisplayHeight
  }
  
  const widthPx = `${adjustedDisplayWidth}px`
  const heightPx = `${adjustedDisplayHeight}px`
  
  switch (position) {
    case 'top-left':
      return { 
        top: '0', 
        left: '0', 
        width: widthPx,
        height: heightPx,
        transform: 'none',
        maxHeight: '100%',
        maxWidth: '100%'
      }
    case 'top-right':
      return { 
        top: '0', 
        right: '0', 
        width: widthPx,
        height: heightPx,
        transform: 'none',
        maxHeight: '100%',
        maxWidth: '100%'
      }
    case 'bottom-left':
      return { 
        bottom: '0', 
        left: '0', 
        width: widthPx,
        height: heightPx,
        transform: 'none',
        maxHeight: '100%',
        maxWidth: '100%'
      }
    case 'bottom-right':
      return { 
        bottom: '0', 
        right: '0', 
        width: widthPx,
        height: heightPx,
        transform: 'none',
        maxHeight: '100%',
        maxWidth: '100%'
      }
  }
}

// FFmpegの初期化
onMounted(async () => {
  // クライアントサイドでのみ実行
  if (import.meta.server) return
  
  // デフォルトカットを初期化
  initializeDefaultCut()
  
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
  isLoadingMediaLibrary.value = true
  mediaLibraryError.value = null
  
  try {
    console.log('[MediaLibrary] Loading media library...')
    
    // Supabaseが利用可能か確認
    if (!supabase) {
      console.warn('[MediaLibrary] Supabase client not available')
      uploadedVideos.value = []
      mediaLibraryError.value = 'Supabase接続が利用できません'
      return
    }
    
    console.log('[MediaLibrary] Fetching video list from Supabase...')
    const { data, error } = await supabase.storage
      .from('videos')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) {
      console.error('[MediaLibrary] Error fetching videos:', error)
      // ストレージバケットが存在しない場合などは警告のみ
      if (error.message?.includes('not found') || error.message?.includes('does not exist') || error.message?.includes('Bucket not found')) {
        console.warn('[MediaLibrary] Storage bucket "videos" does not exist. This is OK if you haven\'t set up Supabase storage yet.')
        uploadedVideos.value = []
        mediaLibraryError.value = 'Supabaseストレージバケット「videos」が設定されていません。メディアライブラリ機能を使用するには、Supabaseでストレージバケットを作成してください。'
        return
      }
      
      // RLSポリシーエラーの場合
      if (error.message?.includes('row-level security policy') || error.message?.includes('RLS')) {
        console.warn('[MediaLibrary] Row Level Security policy error.')
        uploadedVideos.value = []
        mediaLibraryError.value = 'SupabaseストレージのRow Level Security (RLS)ポリシーが設定されていません。メディアライブラリ機能を使用するには、Supabaseでストレージバケット「videos」のRLSポリシーを設定してください。'
        return
      }
      
      throw error
    }
    
    console.log('[MediaLibrary] Found videos:', data?.length || 0)
    
    // フォルダや完成動画のフォルダを除外
    const filteredData = (data || []).filter((file) => {
      // フォルダを除外（idがnullのものはフォルダ）
      if (!file.id) {
        return false
      }
      // completedフォルダとthumbnailsフォルダを除外
      if (file.name === 'completed' || file.name === 'thumbnails') {
        return false
      }
      // 完成動画のファイル名パターンを除外（completed-で始まるファイル）
      if (file.name.startsWith('completed-')) {
        return false
      }
      // サムネイルのファイル名パターンを除外（thumb-で始まるファイル）
      if (file.name.startsWith('thumb-')) {
        return false
      }
      // 動画ファイルのみを表示（拡張子で判定）
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv']
      const hasVideoExtension = videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      if (!hasVideoExtension) {
        return false
      }
      return true
    })
    
    uploadedVideos.value = filteredData.map((file) => ({
      id: file.id || file.name,
      name: file.name,
      url: '' // URLは後で取得
    }))
    
    console.log('[MediaLibrary] Mapped videos:', uploadedVideos.value.length)
    
    // 各動画のURLを取得
    for (const video of uploadedVideos.value) {
      try {
        const { data: urlData } = await supabase.storage
          .from('videos')
          .getPublicUrl(video.name)
        if (urlData) {
          video.url = urlData.publicUrl
          console.log('[MediaLibrary] Got URL for:', video.name)
        }
      } catch (urlError) {
        console.warn(`[MediaLibrary] Could not get URL for ${video.name}:`, urlError)
      }
    }
    
    console.log('[MediaLibrary] Media library loaded successfully. Total videos:', uploadedVideos.value.length)
  } catch (error: any) {
    console.error('[MediaLibrary] Error loading media library:', error)
    // ネットワークエラーやSupabase接続エラーは警告のみ（アプリは動作可能）
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      console.warn('[MediaLibrary] Could not connect to Supabase. Media library feature will be unavailable, but video editing will still work.')
      mediaLibraryError.value = 'Supabaseに接続できません。インターネット接続を確認してください。'
    } else {
      mediaLibraryError.value = `エラー: ${error?.message || '不明なエラー'}`
    }
    uploadedVideos.value = []
  } finally {
    isLoadingMediaLibrary.value = false
  }
}

// 動画ファイルの選択
const handleVideoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('video/')) {
    // カットが存在しない場合は新規作成
    if (cuts.value.length === 0 || activeCutId.value === null) {
      addCut()
    }
    
    const cut = activeCut.value
    if (!cut) return
    
    cut.videoFile = file
    cut.videoUrl = URL.createObjectURL(file)
    
    // 動画の長さを取得
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = cut.videoUrl
    video.onloadedmetadata = () => {
      cut.videoDuration = video.duration
      cut.endTime = video.duration
    }
    
    // Supabaseにアップロード
    await uploadVideoToSupabase(file)
    
    // ファイル入力をリセット
    target.value = ''
  }
}

// Supabaseに動画をアップロード（メディアライブラリに追加される）
// 注意: アップロードした動画のみがメディアライブラリに保存されます
// 完成動画やトリミング後の動画は自動保存されません
const uploadVideoToSupabase = async (file: File) => {
  try {
    // Supabaseが利用可能か確認
    if (!supabase) {
      console.warn('[Upload] Supabase client not available, skipping upload')
      return
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName
    
    console.log('[Upload] Uploading video to Supabase:', fileName)
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('[Upload] Upload error:', uploadError)
      
      // バケットが存在しない場合の特別な処理
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        console.warn('[Upload] Storage bucket "videos" does not exist. Video will work locally but won\'t be saved to media library.')
        // エラーをスローせず、ローカルでのみ使用可能にする
        return
      }
      
      // RLSポリシーエラーの場合の特別な処理
      if (uploadError.message?.includes('row-level security policy') || uploadError.message?.includes('RLS')) {
        console.warn('[Upload] Row Level Security policy error. Video will work locally but won\'t be saved to media library.')
        console.warn('[Upload] Please check Supabase Storage policies for the "videos" bucket.')
        // エラーをスローせず、ローカルでのみ使用可能にする
        return
      }
      
      throw uploadError
    }
    
    console.log('[Upload] Video uploaded successfully:', fileName)
    
    // メディアライブラリを更新（アップロードした動画のみが表示される）
    await loadMediaLibrary()
  } catch (error: any) {
    console.error('[Upload] Error uploading video:', error)
    // エラーが発生しても続行（ローカルで使用可能）
    // ただし、メディアライブラリには表示されません
  }
}

// メディアライブラリから動画を選択
const selectVideoFromLibrary = async (video: { id: string; url: string; name: string }) => {
  // カットが存在しない場合は新規作成
  if (cuts.value.length === 0 || activeCutId.value === null) {
    addCut()
  }
  
  const cut = activeCut.value
  if (!cut) return
  
  showMediaLibrary.value = false
  cut.videoUrl = video.url
  
  // 動画ファイルを取得
  try {
    const response = await fetch(video.url)
    const blob = await response.blob()
    cut.videoFile = new File([blob], video.name, { type: blob.type })
  } catch (error) {
    console.error('Error fetching video file:', error)
  }
  
  // 動画の長さを取得
  const videoEl = document.createElement('video')
  videoEl.preload = 'metadata'
  videoEl.src = video.url
  videoEl.onloadedmetadata = () => {
    cut.videoDuration = videoEl.duration
    cut.endTime = videoEl.duration
  }
}

// 動画のトリミング
const applyTrim = async () => {
  const cut = activeCut.value
  if (!cut) {
    alert('カットを選択してください')
    return
  }
  
  if (!cut.videoUrl) {
    alert('動画をアップロードしてください')
    return
  }
  
  if (!cut.videoFile) {
    alert('動画ファイルが見つかりません。再度アップロードしてください。')
    return
  }
  
  if (!ffmpeg.value || !isFFmpegLoaded.value) {
    alert('動画編集エンジンが読み込まれていません。しばらく待ってから再度お試しください。\n\nページを再読み込み（F5キー）しても解決しない場合は、ブラウザのコンソール（F12キー）でエラーを確認してください。')
    return
  }
  
  if (cut.startTime >= cut.endTime) {
    alert('開始時間は終了時間より前である必要があります')
    return
  }
  
  if (cut.endTime > cut.videoDuration) {
    alert(`終了時間は動画の長さ（${cut.videoDuration.toFixed(2)}秒）を超えることはできません`)
    return
  }
  
  try {
    isTrimming.value = true
    
    const duration = cut.endTime - cut.startTime
    console.log('[Trim] Starting trim:', {
      startTime: cut.startTime,
      endTime: cut.endTime,
      duration: duration,
      fileSize: cut.videoFile.size,
      fileName: cut.videoFile.name
    })
    
    // 入力ファイル名を動画の拡張子に合わせる
    const inputFileName = `input_${cut.id}.${cut.videoFile.name.split('.').pop() || 'mp4'}`
    const outputFileName = `output_${cut.id}.mp4`
    
    // 入力ファイルをFFmpegに書き込む
    console.log('[Trim] Writing input file:', inputFileName)
    await ffmpeg.value.writeFile(inputFileName, await fetchFile(cut.videoFile))
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
        '-ss', cut.startTime.toString(),
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
              '-ss', cut.startTime.toString(),
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
          '-ss', cut.startTime.toString(),
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
    if (cut) {
      cut.trimmedVideoUrl = URL.createObjectURL(blob)
    }
    console.log('[Trim] Output file created, size:', blob.size)
    
    // 一時ファイルを削除
    try {
      await ffmpeg.value.deleteFile(inputFileName)
      await ffmpeg.value.deleteFile(outputFileName)
    } catch (cleanupError) {
      console.warn('[Trim] Cleanup error (non-critical):', cleanupError)
    }
    
    // トリミング前のセクションを自動的に閉じる
    if (activeCut.value) {
      activeCut.value.isCollapsed = true
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
  if (!activeCut.value) return
  const newItem = {
    id: textItemIdCounter++,
    text: '',
    startTime: 0,
    endTime: 0
  }
  activeCut.value.textItems.push(newItem)
}

// テキストアイテムの削除
const removeTextItem = (id: number) => {
  if (!activeCut.value) return
  activeCut.value.textItems = activeCut.value.textItems.filter(item => item.id !== id)
}

// テキストアイテムのドラッグ開始
const handleTextItemDragStart = (itemId: number, event: DragEvent) => {
  draggedTextItemId.value = itemId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', '')
  }
}

// テキストアイテムのドラッグオーバー
const handleTextItemDragOver = (itemId: number, event: DragEvent) => {
  if (draggedTextItemId.value === null || draggedTextItemId.value === itemId) {
    return
  }
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverTextItemId.value = itemId
}

// テキストアイテムのドラッグリーブ
const handleTextItemDragLeave = () => {
  dragOverTextItemId.value = null
}

// テキストアイテムのドロップ
const handleTextItemDrop = (itemId: number, event: DragEvent) => {
  event.preventDefault()
  if (!activeCut.value) return
  if (draggedTextItemId.value === null || draggedTextItemId.value === itemId) {
    draggedTextItemId.value = null
    dragOverTextItemId.value = null
    return
  }
  
  const draggedIndex = activeCut.value.textItems.findIndex(item => item.id === draggedTextItemId.value)
  const dropIndex = activeCut.value.textItems.findIndex(item => item.id === itemId)
  
  if (draggedIndex !== -1 && dropIndex !== -1) {
    // テキストアイテムの順番を変更
    const [draggedItem] = activeCut.value.textItems.splice(draggedIndex, 1)
    activeCut.value.textItems.splice(dropIndex, 0, draggedItem)
  }
  
  draggedTextItemId.value = null
  dragOverTextItemId.value = null
}

// テキストアイテムのドラッグ終了
const handleTextItemDragEnd = () => {
  draggedTextItemId.value = null
  dragOverTextItemId.value = null
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
  if (!activeCut.value) return
  activeCut.value.imageItems.push({
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
  if (!activeCut.value) return
  activeCut.value.imageItems = activeCut.value.imageItems.filter(item => item.id !== id)
}

// 画像ファイルの選択
const handleImageUpload = (event: Event, itemId: number) => {
  if (!activeCut.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const item = activeCut.value.imageItems.find(i => i.id === itemId)
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
const openMediaLibrary = async () => {
  console.log('[MediaLibrary] Opening media library...')
  // メディアライブラリを開く前に最新の状態を読み込む
  await loadMediaLibrary()
  console.log('[MediaLibrary] Current videos count:', uploadedVideos.value.length)
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
    
    // 動画のサイズを取得（video要素から取得）
    let actualVideoWidth = videoWidth.value
    let actualVideoHeight = videoHeight.value
    
    // トリミング後の動画のvideo要素からサイズを取得
    if (trimmedVideoRef.value && trimmedVideoRef.value.videoWidth && trimmedVideoRef.value.videoHeight) {
      actualVideoWidth = trimmedVideoRef.value.videoWidth
      actualVideoHeight = trimmedVideoRef.value.videoHeight
      console.log('[Overlay] Video size from video element:', actualVideoWidth, 'x', actualVideoHeight)
    } else {
      // video要素から取得できない場合、保存されている値を使用
      console.warn('[Overlay] Video size not available from video element, using stored values:', actualVideoWidth, 'x', actualVideoHeight)
      // 動画ファイルから直接サイズを取得する試み
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = trimmedVideoUrl.value
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          if (video.videoWidth && video.videoHeight) {
            actualVideoWidth = video.videoWidth
            actualVideoHeight = video.videoHeight
            console.log('[Overlay] Video size from video file:', actualVideoWidth, 'x', actualVideoHeight)
          }
          resolve()
        }
        video.onerror = () => resolve()
        // タイムアウト
        setTimeout(() => resolve(), 1000)
      })
    }
    
    console.log('[Overlay] Using video size for image calculation:', actualVideoWidth, 'x', actualVideoHeight)
    
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
    
    // テキストサイズに応じたフォントサイズを決定
    const fontSizeMap = {
      small: 24,
      medium: 32,
      large: 40
    }
    const fontSize = fontSizeMap[textSize.value]
    
    // テキストオーバーレイを追加
    textItems.value.forEach((item) => {
      if (item.text.trim() !== '' && item.startTime >= 0 && item.endTime > item.startTime) {
        // 改行を\nに変換（textareaの改行をFFmpegで処理できるように）
        const textWithNewlines = item.text.replace(/\n/g, '\\n')
        const escapedText = textWithNewlines.replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\[/g, '\\[').replace(/\]/g, '\\]')
        // フォントファイルを指定（FFmpeg.wasmにはデフォルトフォントがないため必須）
        // トリミング後プレビューと同じ見た目にするため、黒縁なし・シャドウのみ
        const textFilter =
          `drawtext=fontfile=${fontName}:` +
          `text='${escapedText}':` +
          `fontsize=${fontSize}:` +
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
    
    // 画像オーバーレイ情報を収集（サイズを動画の1/2に制限、位置を画面端に合わせる）
    for (let index = 0; index < imageItems.value.length; index++) {
      const item = imageItems.value[index]
      if (item.file && item.startTime >= 0 && item.endTime > item.startTime) {
        // 画像のサイズを計算（動画サイズの1/2を最大値として、アスペクト比を維持）
        // 実際の動画サイズを使用
        const maxWidth = Math.floor(actualVideoWidth / 2)
        const maxHeight = Math.floor(actualVideoHeight / 2)
        
        console.log('[Overlay] Image size calculation start:', {
          videoSize: { width: actualVideoWidth, height: actualVideoHeight },
          maxSize: { width: maxWidth, height: maxHeight }
        })
        
        // 画像の元のサイズを取得（Image要素から、非同期で読み込む）
        let imgWidth = 200 // デフォルト値
        let imgHeight = 200 // デフォルト値
        
        if (item.url) {
          // 画像を読み込んでサイズを取得
          await new Promise<void>((resolve) => {
            const img = new Image()
            img.onload = () => {
              imgWidth = img.naturalWidth || img.width || 200
              imgHeight = img.naturalHeight || img.height || 200
              resolve()
            }
            img.onerror = () => {
              resolve() // エラーでも続行
            }
            img.src = item.url!
          })
        }
        
        // アスペクト比を維持してリサイズ（動画サイズの1/2を最大値として）
        // maxWidthとmaxHeightは既に動画サイズの1/2なので、これを使用
        // 横幅と縦幅の両方が1/2を超えないようにする（アスペクト比を維持）
        const widthRatio = maxWidth / imgWidth
        const heightRatio = maxHeight / imgHeight
        // より厳しい制限を適用（小さい方の比率を使用）
        const ratio = Math.min(widthRatio, heightRatio)
        
        let finalAdjustedWidth = Math.floor(imgWidth * ratio)
        let finalAdjustedHeight = Math.floor(imgHeight * ratio)
        
        // 最終的な保証（確実に1/2以下にする）
        // 横幅と縦幅の両方がmaxWidthとmaxHeightを超えないことを保証
        if (finalAdjustedWidth > maxWidth) {
          const adjustRatio = maxWidth / finalAdjustedWidth
          finalAdjustedWidth = Math.floor(finalAdjustedWidth * adjustRatio)
          finalAdjustedHeight = Math.floor(finalAdjustedHeight * adjustRatio)
        }
        if (finalAdjustedHeight > maxHeight) {
          const adjustRatio = maxHeight / finalAdjustedHeight
          finalAdjustedWidth = Math.floor(finalAdjustedWidth * adjustRatio)
          finalAdjustedHeight = Math.floor(finalAdjustedHeight * adjustRatio)
        }
        
        // 最終的な保証（念のため、確実に1/2以下にする）
        finalAdjustedWidth = Math.min(finalAdjustedWidth, maxWidth)
        finalAdjustedHeight = Math.min(finalAdjustedHeight, maxHeight)
        
        console.log('[Overlay] Image size calculation:', {
          original: { width: imgWidth, height: imgHeight },
          maxAllowed: { width: maxWidth, height: maxHeight },
          final: { width: finalAdjustedWidth, height: finalAdjustedHeight },
          videoSize: { width: actualVideoWidth, height: actualVideoHeight },
          ratio: { 
            width: finalAdjustedWidth / actualVideoWidth, 
            height: finalAdjustedHeight / actualVideoHeight,
            maxWidthRatio: maxWidth / actualVideoWidth,
            maxHeightRatio: maxHeight / actualVideoHeight
          },
          isWithinLimit: {
            width: finalAdjustedWidth <= maxWidth,
            height: finalAdjustedHeight <= maxHeight
          }
        })
        
        // 位置を設定（画面端に合わせる）
        let x = '0'
        let y = '0'

        switch (item.position) {
          case 'top-left':
            x = '0'
            y = '0'
            break
          case 'top-right':
            x = `W-${finalAdjustedWidth}`
            y = '0'
            break
          case 'bottom-left':
            x = '0'
            y = `H-${finalAdjustedHeight}`
            break
          case 'bottom-right':
            x = `W-${finalAdjustedWidth}`
            y = `H-${finalAdjustedHeight}`
            break
        }

        const imageFile = imageFiles[index]
        if (imageFile) {
          imageOverlays.push({
            file: imageFile,
            x,
            y,
            width: finalAdjustedWidth,
            height: finalAdjustedHeight,
            startTime: item.startTime,
            endTime: item.endTime
          })
        }
      }
    }
    
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
    
    // 画像オーバーレイを適用（画像をリサイズしてからオーバーレイ）
    imageOverlays.forEach((overlay, index) => {
      const inputIndex = index + 1
      const scaledImageLabel = `scaled${index}`
      
      // 画像をリサイズするフィルター（高速化のためflags=fast_bilinearを使用）
      const scaleFilter = `[${inputIndex}:v]scale=${overlay.width}:${overlay.height}:flags=fast_bilinear[${scaledImageLabel}]`
      
      // オーバーレイフィルター（リサイズした画像を使用）
      const overlayFilter = `${currentVideoLabel}[${scaledImageLabel}]overlay=${overlay.x}:${overlay.y}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${step}]`
      
      // スケールフィルターとオーバーレイフィルターを結合
      const combinedFilter = `${scaleFilter};${overlayFilter}`
      
      if (filterComplex) {
        filterComplex += `;${combinedFilter}`
      } else {
        filterComplex = combinedFilter
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
      command.push('-preset', 'ultrafast') // 処理速度を最優先
      command.push('-crf', '30') // 画質と速度のバランス（28より少し低画質だが高速）
      command.push('-threads', '0') // 全CPUコアを使用
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
    const cut = activeCut.value
    const videoUrl = URL.createObjectURL(blob)
    if (cut) {
      cut.finalVideoUrl = videoUrl
    }
    // グローバルのfinalVideoUrlも更新（テンプレートで表示するため）
    finalVideoUrl.value = videoUrl
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
  const cut = activeCut.value
  return cut?.videoUrl !== null && 
         cut?.videoFile !== null && 
         ffmpeg.value !== null && 
         isFFmpegLoaded.value &&
         cut?.startTime >= 0 && 
         cut?.startTime < cut?.endTime &&
         cut?.endTime <= cut?.videoDuration &&
         !isTrimming.value &&
         !isFFmpegLoading.value
})

// 完成動画のダウンロード
const downloadFinalVideo = () => {
  if (!finalVideoUrl.value) {
    alert('完成動画がありません')
    return
  }
  
  const title = videoTitle.value.trim() || '動画'
  const fileName = `${title}.mp4`
  
  const link = document.createElement('a')
  link.href = finalVideoUrl.value
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 完成動画をコースに保存
const saveCompletedVideoToCourse = async (videoBlob: Blob) => {
  if (!supabase) {
    console.warn('[Save] Supabase client not available, skipping save')
    return
  }

  try {
    // 現在のユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインが必要です')
      return
    }

    // 動画ファイル名を生成
    const fileName = `completed-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
    const filePath = `completed/${fileName}`

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, videoBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'video/mp4'
      })

    if (uploadError) {
      console.error('[Save] Upload error:', uploadError)
      // バケットが存在しない場合などは警告のみ
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        console.warn('[Save] Storage bucket "videos" does not exist. Video will not be saved to course.')
        return
      }
      throw uploadError
    }

    // 公開URLを取得
    const { data: urlData } = await supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    const videoUrl = urlData.publicUrl

    // サムネイルを生成（動画の最初のフレーム）
    let thumbnailUrl = null
    try {
      const video = document.createElement('video')
      video.src = finalVideoUrl.value || ''
      video.currentTime = 0.1
      video.muted = true
      video.playsInline = true
      
      await new Promise((resolve, reject) => {
        video.onloadeddata = () => {
          video.currentTime = 0.1
          resolve(null)
        }
        video.onerror = reject
        setTimeout(() => resolve(null), 2000) // タイムアウト
      })
      
      await new Promise((resolve) => {
        video.onseeked = resolve
        setTimeout(resolve, 1000)
      })
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      const ctx = canvas.getContext('2d')
      if (ctx && video.videoWidth > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.8)
        })
        
        if (thumbBlob) {
          const thumbFileName = `thumb-${Date.now()}.jpg`
          const thumbPath = `thumbnails/${thumbFileName}`
          const { error: thumbError } = await supabase.storage
            .from('videos')
            .upload(thumbPath, thumbBlob, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg'
            })
          if (!thumbError) {
            const { data: thumbUrlData } = await supabase.storage
              .from('videos')
              .getPublicUrl(thumbPath)
            thumbnailUrl = thumbUrlData.publicUrl
          }
        }
      }
    } catch (thumbError) {
      console.warn('[Save] Failed to generate thumbnail:', thumbError)
    }

    // データベースに動画メタデータを保存（未分類として）
    console.log('[Save] Saving video metadata to database')
    const response = await $fetch('/api/videos', {
      method: 'POST',
      body: {
        title: videoTitle.value || '無題の動画',
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        category_id: null, // 未分類
        user_id: user.id
      }
    }).catch((error: any) => {
      console.error('[Save] API error details:', {
        message: error?.data?.message || error?.message,
        statusCode: error?.statusCode,
        data: error?.data,
        fullError: error
      })
      throw error
    })

    console.log('[Save] Video saved successfully:', response)
    alert('動画をコースに保存しました。')
  } catch (error: any) {
    console.error('[Save] Error saving completed video:', error)
    // Nuxtの$fetchエラーでは、エラーメッセージはerror.data.messageまたはerror.messageに含まれる
    const errorMessage = error?.data?.message || error?.message || 'Unknown error'
    console.error('[Save] Error details:', {
      message: errorMessage,
      statusCode: error?.statusCode,
      data: error?.data
    })
    alert('動画の保存中にエラーが発生しました: ' + errorMessage)
  }
}

// 完成ボタン：全てのカットを連結
const completeVideo = async () => {
  if (cuts.value.length === 0) {
    alert('カットが1つもありません')
    return
  }
  
  // 全てのカットが編集済みかチェック
  const uneditedCuts = cuts.value.filter(c => !c.finalVideoUrl && !c.trimmedVideoUrl)
  if (uneditedCuts.length > 0) {
    alert(`${uneditedCuts.length}個のカットがまだ編集されていません。全てのカットの編集を完了してください。`)
    return
  }
  
  if (!ffmpeg.value || !isFFmpegLoaded.value) {
    alert('動画編集エンジンが読み込まれていません。しばらく待ってから再度お試しください。')
    return
  }
  
  try {
    isCompleting.value = true
    console.log('[Complete] Starting video concatenation')
    
    // 各カットの最終ファイルを取得（finalVideoUrlがあればそれ、なければtrimmedVideoUrl）
    const videoFiles: string[] = []
    for (let i = 0; i < cuts.value.length; i++) {
      const cut = cuts.value[i]
      const videoUrl = cut.finalVideoUrl || cut.trimmedVideoUrl
      if (!videoUrl) continue
      
      // 動画をFFmpegに書き込む
      const blob = await fetch(videoUrl).then(r => r.blob())
      const file = new File([blob], `video${i}.mp4`, { type: 'video/mp4' })
      const fileName = `input${i}.mp4`
      await ffmpeg.value.writeFile(fileName, await fetchFile(file))
      videoFiles.push(fileName)
    }
    
    if (videoFiles.length === 0) {
      throw new Error('連結する動画がありません')
    }
    
    // concatファイルリストを作成
    const concatContent = videoFiles.map(f => `file '${f}'`).join('\n')
    const concatFileName = 'concat.txt'
    await ffmpeg.value.writeFile(concatFileName, concatContent)
    
    // FFmpegで連結
    const outputFileName = 'final.mp4'
    const command = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFileName,
      '-c', 'copy',
      outputFileName
    ]
    
    console.log('[Complete] Executing FFmpeg concat command:', command.join(' '))
    await ffmpeg.value.exec(command)
    
    // 出力ファイルを読み込む
    const fileData = await ffmpeg.value.readFile(outputFileName)
    const data = fileData instanceof Uint8Array ? fileData : (typeof fileData === 'string' ? new TextEncoder().encode(fileData) : new Uint8Array(fileData as unknown as ArrayBuffer))
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
    finalVideoUrl.value = URL.createObjectURL(blob)
    
    // 完成動画をコースに保存
    await saveCompletedVideoToCourse(blob)
    // ダウンロードボタンから手動でダウンロードできます
    
    // 一時ファイルを削除
    try {
      for (const file of videoFiles) {
        await ffmpeg.value.deleteFile(file)
      }
      await ffmpeg.value.deleteFile(concatFileName)
      await ffmpeg.value.deleteFile(outputFileName)
    } catch (cleanupError) {
      console.warn('[Complete] Cleanup error (non-critical):', cleanupError)
    }
    
    alert('動画の連結が完了しました')
  } catch (error: any) {
    console.error('[Complete] Error concatenating videos:', error)
    alert('動画の連結中にエラーが発生しました。\n\nブラウザのコンソール（F12キー）で詳細なエラーを確認できます。')
  } finally {
    isCompleting.value = false
  }
}

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
        
        <!-- テキストサイズ選択 -->
        <div class="text-size-selector">
          <label>テキストサイズ</label>
          <select v-model="textSize" class="text-size-select">
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
        
        <div 
          v-for="(item, index) in textItems" 
          :key="item.id" 
          class="text-item"
          :class="{
            dragging: draggedTextItemId === item.id,
            'drag-over': dragOverTextItemId === item.id
          }"
          @dragover="handleTextItemDragOver(item.id, $event)"
          @dragleave="handleTextItemDragLeave"
          @drop="handleTextItemDrop(item.id, $event)"
        >
          <div 
            class="text-item-drag-handle"
            :draggable="true"
            @dragstart="handleTextItemDragStart(item.id, $event)"
            @dragend="handleTextItemDragEnd"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <textarea 
            v-model="item.text" 
            :placeholder="`テキスト${index + 1}`"
            class="text-textarea"
            rows="3"
          ></textarea>
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
              <span class="time-unit">秒</span>
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
              <span class="time-unit">秒</span>
            </div>
          </div>
          <div class="text-item-actions">
            <button class="time-btn delete-btn" @click="removeTextItem(item.id)">
              削除
            </button>
          </div>
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
              <span class="time-unit">秒</span>
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
              <span class="time-unit">秒</span>
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
      <!-- 動画タイトル入力 -->
      <div class="video-title-section">
        <input
          v-model="videoTitle"
          type="text"
          placeholder="動画タイトル"
          class="video-title-input"
        />
      </div>
      
      <!-- カットタブ -->
      <div class="cuts-tabs">
        <div class="tabs-container">
          <div
            v-for="cut in cuts"
            :key="cut.id"
            class="tab"
            :class="{ 
              active: activeCutId === cut.id, 
              editing: editingCutId === cut.id,
              dragging: draggedCutId === cut.id,
              'drag-over': dragOverCutId === cut.id
            }"
            :draggable="editingCutId !== cut.id"
            @click="selectCut(cut.id)"
            @dblclick.stop="startEditingCutName(cut.id, $event)"
            @dragstart="handleDragStart(cut.id, $event)"
            @dragover="handleDragOver(cut.id, $event)"
            @dragleave="handleDragLeave"
            @drop="handleDrop(cut.id, $event)"
            @dragend="handleDragEnd"
          >
            <svg 
              v-if="!editingCutId || editingCutId !== cut.id"
              class="drag-handle"
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
              @mousedown.stop
            >
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <circle cx="15" cy="19" r="1"/>
            </svg>
            <input
              v-if="editingCutId === cut.id"
              v-model="cut.name"
              @blur="finishEditingCutName(cut.id, cut.name)"
              @keydown.enter="finishEditingCutName(cut.id, cut.name)"
              @keydown.esc="cancelEditingCutName"
              class="tab-name-input"
              @click.stop
            />
            <span v-else>{{ cut.name }}</span>
            <button
              v-if="cuts.length > 1"
              class="tab-remove-btn"
              @click.stop="removeCut(cut.id)"
              title="削除"
            >
              ×
            </button>
          </div>
        </div>
        <div class="tabs-actions">
          <button class="add-cut-btn" @click="addCut" title="カットを追加">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button 
            class="complete-btn" 
            @click="completeVideo" 
            :disabled="isCompleting || cuts.length === 0"
          >
            {{ isCompleting ? '完成中...' : '完成' }}
          </button>
        </div>
      </div>
      
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
                :class="`text-size-${textSize}`"
              >
                {{ item.text }}
              </div>

              <!-- リアルタイムプレビュー用画像オーバーレイ -->
              <div
                v-for="item in activeImageOverlays"
                :key="`image-preview-${item.id}`"
                class="overlay-image"
                :style="getImageOverlayStyle(item.position, item.id, item.url || null)"
              >
                <img
                  v-if="item.url"
                  :src="item.url"
                  alt="overlay"
                  @load="(e) => updateImageSize(e.target as HTMLImageElement, item.id)"
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
          <div class="download-section">
            <button class="download-btn" @click="downloadFinalVideo">
              動画をダウンロード
            </button>
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
        <!-- ローディング中 -->
        <div v-if="isLoadingMediaLibrary" class="loading-message">
          <p>メディアライブラリを読み込んでいます...</p>
        </div>
        
        <!-- エラーメッセージ -->
        <div v-else-if="mediaLibraryError" class="error-message">
          <p><strong>エラー</strong></p>
          <p>{{ mediaLibraryError }}</p>
          <div v-if="mediaLibraryError.includes('RLS') || mediaLibraryError.includes('row-level security')" class="error-instructions">
            <p><strong>設定方法：</strong></p>
            <ol>
              <li>Supabaseダッシュボードにログイン</li>
              <li>「Storage」→「Policies」に移動</li>
              <li>「videos」バケットのポリシーを設定：
                <ul>
                  <li><strong>INSERT</strong>: 認証済みユーザーがアップロード可能</li>
                  <li><strong>SELECT</strong>: 認証済みユーザーが読み取り可能</li>
                </ul>
              </li>
              <li>または、バケットを「Public」に設定して全員がアクセス可能にする</li>
            </ol>
          </div>
          <button class="retry-btn" @click="loadMediaLibrary">再試行</button>
        </div>
        
        <!-- メディア一覧（件数に応じて表示を切り替え） -->
        <div v-else-if="uploadedVideos.length > 0" class="media-grid">
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

/* テキストサイズセレクター */
.text-size-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-size-selector label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.text-size-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.text-size-select:focus {
  outline: none;
  border-color: #9333ea;
}

/* テキストアイテム */
.text-item {
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.2s;
  position: relative;
}

.text-item:hover {
  background: #f3f4f6;
}

.text-item.dragging {
  opacity: 0.5;
}

.text-item.drag-over {
  border: 2px solid #9333ea;
  background: #f3f4f6;
}

.text-item-drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: move;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 10;
}

.text-item-drag-handle:hover {
  color: #9333ea;
  background: #f0f0f0;
}


.text-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 10px;
  box-sizing: border-box;
  background: white;
}

.text-textarea:focus {
  outline: none;
  border-color: #9333ea;
}

.time-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
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

.time-unit {
  font-size: 12px;
  color: #666;
}

.text-item-actions {
  display: flex;
  gap: 8px;
}

.time-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #333;
}

.time-btn:hover {
  background: #f5f5f5;
}

.time-btn.start-btn:hover {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.time-btn.end-btn:hover {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.time-btn.delete-btn {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.time-btn.delete-btn:hover {
  background: #fecaca;
  border-color: #fca5a5;
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

/* 動画タイトルセクション */
.video-title-section {
  margin-bottom: 20px;
}

.video-title-input {
  width: 100%;
  max-width: 600px;
  padding: 16px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.video-title-input:focus {
  border-color: #9333ea;
}

.video-title-input::placeholder {
  color: #999;
}

/* カットタブ */
.cuts-tabs {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tabs-container {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  color: #9333ea;
  background: #f9fafb;
}

.tab.active {
  color: #9333ea;
  border-bottom-color: #9333ea;
}

.tab.editing {
  padding: 12px 20px;
}

.tab-name-input {
  border: 2px solid #9333ea;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: white;
  outline: none;
  min-width: 80px;
  max-width: 200px;
}

.tab.dragging {
  opacity: 0.5;
}

.tab.drag-over {
  border-top: 2px solid #9333ea;
}

.drag-handle {
  color: #999;
  cursor: grab;
  flex-shrink: 0;
  margin-right: 4px;
}

.drag-handle:active {
  cursor: grabbing;
}

.tab:not(.editing):hover .drag-handle {
  color: #9333ea;
}

.tab-remove-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  padding: 0;
  line-height: 1;
}

.tab-remove-btn:hover {
  background: #fecaca;
}

.tabs-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-left: 20px;
  border-left: 1px solid #e0e0e0;
}

.add-cut-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-cut-btn:hover {
  background: #f5f5f5;
  border-color: #9333ea;
  color: #9333ea;
}

.complete-btn {
  padding: 8px 20px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.complete-btn:hover:not(:disabled) {
  background: #7e22ce;
}

.complete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  overflow: hidden;
}

.overlay-text {
  position: absolute;
  left: 50%;
  bottom: 30px; /* FFmpegのy=h-th-40に近づけるため微調整 */
  transform: translateX(-50%);
  color: #fff;
  font-size: 24px;              /* デフォルトは小サイズ */
  max-width: 80%;
  text-align: center;
  word-break: break-word;
  white-space: pre-line;         /* 改行を反映 */
  font-weight: normal;          /* FFmpeg側と統一（デフォルトの太さ） */
  /* FFmpeg側と同じシャドウ設定（shadowx=1, shadowy=1, shadowcolor=black@0.6） */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.overlay-text.text-size-small {
  font-size: 24px;
}

.overlay-text.text-size-medium {
  font-size: 32px;
}

.overlay-text.text-size-large {
  font-size: 40px;
}

.overlay-image {
  position: absolute;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
}

.overlay-image img {
  display: block;
  width: 100%;
  height: 100%;
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
}

.trim-section .time-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.trim-section .time-input-group label {
  font-size: 12px;
  color: #666;
}

.trim-section .time-input-group input {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.trim-section .time-unit {
  font-size: 12px;
  color: #666;
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

.download-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.download-btn {
  padding: 12px 32px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #7e22ce;
}

.download-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.download-btn {
  padding: 12px 32px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #7e22ce;
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

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #7e22ce;
}

.error-instructions {
  margin-top: 15px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 6px;
  text-align: left;
  font-size: 13px;
  line-height: 1.6;
}

.error-instructions p {
  margin: 0 0 10px 0;
}

.error-instructions ol {
  margin: 10px 0;
  padding-left: 20px;
}

.error-instructions ul {
  margin: 5px 0;
  padding-left: 20px;
}

.error-instructions li {
  margin: 5px 0;
}
</style>
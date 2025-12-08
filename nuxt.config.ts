// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // サーバーサイドレンダリングを無効化（SPAモード）
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'], // Supabaseを使う設定
  supabase: {
    redirect: false, // ログイン画面への強制移動をオフにする（開発しやすくするため）
  },
  app: {
    baseURL: '/movie/', // 最後のスラッシュも忘れずに
    buildAssetsDir: '/_nuxt/',
  },
  vite: {
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
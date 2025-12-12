// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // サーバーサイドレンダリングを無効化（SPAモード）
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // modules: ['@nuxtjs/supabase'], // SPAモードでは直接@supabase/supabase-jsを使用するため無効化
  runtimeConfig: {
    supabase: {
      serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
    },
    public: {
      supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_ANON_KEY || ''
      }
    }
  },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/movie/' : '/', // 本番環境では/movie/、開発環境では/
    buildAssetsDir: '/_nuxt/',
  },
  vite: {
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
      include: ['@supabase/supabase-js']
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
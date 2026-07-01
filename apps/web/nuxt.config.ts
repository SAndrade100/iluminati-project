// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/tailwind.config.ts',
  },

  typescript: {
    strict: true,
  },

  imports: {
    dirs: ['stores'],
  },

  // Disable SSR for all routes — app uses JWT in localStorage (client-only auth).
  // routeRules is the correct Nuxt 3.21+ way to get SPA behaviour without the
  // "No entry found in rollupOptions.input" bug caused by the top-level ssr:false flag.
  routeRules: {
    '/**': { ssr: false },
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],
})

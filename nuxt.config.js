export default {
  // Build the app as a static site instead of Server Side Rendered (SSR)
  // (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-mode/)
  ssr: false,
  target: 'server',

  // Use local 404 instead of redirecting to Netlify 404 (https://go.nuxtjs.dev/config-build)
  generate: {
    fallback: true,
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Bitcanna Wallet',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'The Cannabis Blockchain project which is powered by the Industry. BitCanna will provide a decentralized payment network for the legal cannabis industry.',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/cropped-apple-touch-icon-32x32.png',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/cropped-apple-touch-icon-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'apple-touch-icon',
        type: 'image/x-icon',
        href: '/cropped-apple-touch-icon-180x180.png',
      },
    ],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['@/styles/app.css'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/copy.client.js',
    '@/plugins/focus.client.js',
    '@/plugins/infinite-scroll.client.js',
    '@/plugins/init.client.js',
    '@/plugins/validate.client.js',
    '@/plugins/scroll-to.client.js',
    '@/plugins/tooltip.client.js',
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://github.com/anteriovieira/nuxt-material-design-icons
    'nuxt-material-design-icons',
    // https://github.com/microcipcip/cookie-universal/tree/master/packages/cookie-universal-nuxt#readme
    'cookie-universal-nuxt',
    // https://github.com/dansmaculotte/nuxt-security
    [
      '@dansmaculotte/nuxt-security',
      {
        dev: true,
        additionalHeaders: true,
        referrer: 'same-origin',
        hsts: {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true
        },
      }
    ],
    // https://github.com/Maronato/vue-toastification
    "vue-toastification/nuxt",
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    progress: false,
    retry: { retries: 1 },
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  server: {
    // default: localhost
    host: '0',
  },
}

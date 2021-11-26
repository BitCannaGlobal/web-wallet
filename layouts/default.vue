<template>
  <div id="app" class="lunie-light">
    <CommonAppHeader />
    <CommonNotifications />
    <div id="app-content">
      <Nuxt />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/common/network'

export default {
  name: 'Layout',
  middleware({ store }) {
    if (!store.state.data.api) {
      store.dispatch('data/init') // init api
    }
  },
  computed: {
    ...mapState(['session']),
    ...mapState(['data', ['validators']]),
    ...mapState('keplr', [`accounts`, `initialized`, `error`, `loading`]),
  },
  mounted() {
    const session = this.$cookies.get('lunie-session')
    this.$store.dispatch('signIn', session) // calls 'data/refresh' to load the users data

    // Detect keplr account change and reload with new data!
    window.addEventListener('keplr_keystorechange', () => loadEdit(this), false)
    async function loadEdit(store) {
      const chainId = network.id
      await window.keplr.enable(chainId)
      const offlineSigner = window.getOfflineSigner(chainId)
      const accounts = await offlineSigner.getAccounts()

      store.$store.dispatch(`signIn`, {
        sessionType: `keplr`,
        address: accounts[0].address,
      })
    }
  },
}
</script>
<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.1s;
}

.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>

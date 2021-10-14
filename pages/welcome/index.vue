<template>
  <div>
    <h1>Welcome to BitCanna</h1>
    <h2>{{ network.description }}</h2>
    <div class="session-list">
      <AddressLiSession
        icon="language"
        title="Explore with any address"
        route="/explore"
      />
      <AddressLiSession
        v-if="initialized"
        icon="web"
        title="Lunie Browser Extension"
        route="/extension"
      />
      <AddressLiSession
        icon="web"
        title="Keplr Browser Extension"
        route="/keplr"
      />
      <!-- <AddressLiSession icon="usb" title="Ledger Nano" route="/ledger" /> -->
      <template v-if="network.localSigning">
        <AddressLiSession
          icon="person"
          title="Use existing address"
          route="/signin"
        />
        <AddressLiSession
          icon="person_add"
          title="Create new address"
          route="/create"
        />
        <AddressLiSession
          id="recover-with-backup"
          icon="settings_backup_restore"
          title="Recover from seed"
          route="/recover"
        />
      </template>
      <!-- <template v-if="network.swapEnabled">
        <AddressLiSession
          icon="compare_arrows"
          title="Swap"
          route="/signout-swap"
        />
      </template> -->
      <a v-if="session" class="link" @click="backToWallet">Back to wallet</a>
      <a v-if="session" class="link" @click="signOut">Sign out</a>
      <a v-else class="link" @click="signOut">Continue without address</a>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/common/network'

export default {
  name: `Home`,
  layout: 'session',
  data: () => ({
    network,
  }),
  computed: {
    ...mapState(['session']),
    ...mapState('extension', ['initialized']),
  },
  mounted() {
    this.$store.dispatch('extension/init')
  },
  methods: {
    signOut() {
      this.$store.dispatch('signIn', undefined)
      this.$router.push('/validators')
    },
    backToWallet() {
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
h1 {
  font-size: var(--text-3xl);
  text-align: center;
  padding-bottom: 1.5rem;
  color: var(--green-1000);
}

h2 {
  font-size: var(--text-sm);
  line-height: 1.5rem;
  text-align: center;
  padding-bottom: 1rem;
}

h4 {
  line-height: 2rem;
  font-size: 14px;
  color: var(--txt);
  font-weight: 500;
  padding-top: 2rem;
}

.session-list {
  padding: 0;
}

.link {
  display: inline-block;
  font-size: var(--text-sm);
  padding: 1rem 1rem;
  text-decoration: underline;
}
</style>

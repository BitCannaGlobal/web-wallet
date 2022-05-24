<template>
  <div class="transactions">
    <div class="header-container">
      <CommonButton
        :href="network.bitcannaExplorerURL + '/accounts/' + session.address"
        value="View all transactions"
        :link="true"
      />
    </div>

    <div v-if="!transactionsLoaded" class="container">
      <CommonLoader />
    </div>

    <CommonCard v-else-if="!transactions.length" icon="receipt">
      <div slot="title">No transactions</div>
      <div slot="subtitle">
        {{ oldChainDataMessage }}
      </div>
    </CommonCard>

    <template v-else>
      <TransactionsEventList
        :events="transactions"
        :more-available="moreTransactionsAvailable"
        @loadMore="loadTransactions"
      />

      <div v-if="transactionsLoaded && transactionsLoading" class="loading-row">
        <svg
          width="44"
          height="44"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#8c8fa6"
        >
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(1 1)" stroke-width="2">
              <circle
                stroke="white"
                stroke-opacity=".2"
                cx="18"
                cy="18"
                r="18"
              />
              <path stroke="white" d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </div>

      <template v-if="transactionsLoaded && !moreTransactionsAvailable">
        <div class="container">
          <p>{{ oldChainDataMessage }}</p>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/network'

export default {
  name: `PageTransactions`,
  middleware: 'addressRequired',
  data: () => ({
    pageNumber: 1,
    network,
  }),
  computed: {
    ...mapState('data', [
      `validators`,
      `transactions`,
      `transactionsLoaded`,
      `transactionsLoading`,
      `moreTransactionsAvailable`,
    ]),
    ...mapState(['session']),
    oldChainDataMessage() {
      return `If you're missing transactions from this list
      they may have occured before the last blockchain upgrade.`
    },
  },
  methods: {
    async loadTransactions() {
      if (this.moreTransactionsAvailable && !this.transactionsLoading) {
        await this.$store.dispatch('data/getTransactions', {
          address: this.session.address,
          pageNumber: this.pageNumber++,
        })
      }
    },
  },
}
</script>
<style scoped>
.header-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.container {
  display: flex;
  align-items: center;
  flex-direction: column;
  background: var(--gray-1100);
  border-radius: var(--border-radius);
  margin: 1rem;
  font-size: 12px;
  color: var(--txt);
}

.container p {
  padding: 2rem;
}

.button {
  margin: 1.5rem;
}

.loading-row svg {
  display: block;
  margin: 20px auto 20px auto;
}
</style>

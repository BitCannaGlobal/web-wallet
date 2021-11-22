<template>
  <div class="container2">
    <h1>Pooling</h1>
    <table class="tableearn">
      <thead>
        <tr>
          <th class="cell">Stake</th>
          <th class="cell"></th>
          <th class="cell">Lockup</th>
          <th class="cell">TVL</th>
          <th class="cell">APR</th>
          <th class="cell"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell">BCNA/ATOM</td>
          <td class="cell"><img src="icon/bcna-cosmos.png" /></td>
          <td class="cell">1-7-14 days</td>
          <td class="cell">${{ tvlData572 | bigFigureOrShortDecimals }}</td>
          <td class="cell">≈ 100% Annualised</td>
          <td class="cell">
            <CommonButton
              :href="network.osmosAppUrl + '/pool/572'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
        <tr>
          <td class="cell">BCNA/OSMOS</td>
          <td class="cell"><img src="icon/bcna-osmos.png" /></td>
          <td class="cell">1-7-14 days</td>
          <td class="cell">${{ tvlData571 | bigFigureOrShortDecimals }}</td>
          <td class="cell">≈ 100% Annualised</td>
          <td class="cell">
            <CommonButton
              :href="network.osmosAppUrl + '/pool/571'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <h1>Stake</h1>
    <table class="tableearn">
      <thead>
        <tr>
          <th class="cell index">Stake</th>
          <th class="cell"></th>
          <th class="cell">Lockup</th>
          <th class="cell">TVL</th>
          <th class="cell">APR</th>
          <th class="cell"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell">Bitcanna delegate</td>
          <td class="cell"><img src="icon/bcna.png" /></td>
          <td class="cell">14 days</td>
          <td class="cell">
            ${{ returnBcnaBonded | bigFigureOrShortDecimals }}
          </td>
          <td class="cell">
            {{ bcnaApr | bigFigureOrShortDecimals }}% (excl. commission)
            <nuxt-link to="/earn" @click.native="hi">
              <i class="material-icons">help</i>
            </nuxt-link>
          </td>
          <td class="cell">
            <nuxt-link to="/validators" class="li-session">
              <CommonButton value="Start earning" />
            </nuxt-link>
          </td>
        </tr>
        <tr>
          <td class="cell">Bitcanna validate</td>
          <td class="cell"><img src="icon/bcna.png" /></td>
          <td class="cell">NA</td>
          <td class="cell">
            ${{ returnBcnaBonded | bigFigureOrShortDecimals }}
          </td>
          <td class="cell">
            {{ bcnaApr | bigFigureOrShortDecimals }}% (excl. commission)
            <i class="material-icons">help</i>
          </td>
          <td class="cell">
            <CommonButton
              :href="'https://docs.bitcanna.io/guides/validator-setup-guide'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import network from '~/network'
import { bigFigureOrShortDecimals } from '~/common/numbers'

export default {
  name: `PageSwap`,
  filters: {
    bigFigureOrShortDecimals,
  },
  data: () => ({
    network,
    tvlData571: '',
    tvlData572: '',
    bcnaAprr: '',
  }),
  computed: {
    ...mapState([`session`]),
    ...mapState(`data`, ['bcnaApr', 'bcnaValue', 'validatorInfoPage']),
    returnBcnaBonded() {
      const finalBonded =
        (this.validatorInfoPage.bonded_tokens / 1000000) * this.bcnaValue
      return finalBonded
    },
  },
  async beforeMount() {
    // Pool 571
    const responseData571 = await axios.get(
      'https://api-osmosis.imperator.co/pools/v1/571'
    )
    this.tvlData571 = responseData571.data[0].liquidity

    // Pool 572
    const responseData572 = await axios.get(
      'https://api-osmosis.imperator.co/pools/v1/572'
    )
    this.tvlData572 = responseData572.data[0].liquidity
  },
  mounted() {
    this.loadData()
  },
  methods: {
    hi(e) {
      const textHelp =
        'Need help?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s.'
      this.$toast.info(textHelp, {
        position: 'top-right',
        timeout: 10000,
        closeOnClick: true,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: 'button',
        icon: true,
      })
    },
    loadData() {
      this.$store.dispatch('data/refresh')
    },
  },
}
</script>

<style>
.container2 {
  /* overflow: auto; */
  border-radius: var(--border-radius);
  background: var(--gray-1100);
}
.icon {
  display: inline-flex;
  align-self: center;
}

.tableearn {
  table-layout: auto;
  min-width: 100%;
  border-radius: 30px;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: -10px;
}
.tableearn th {
  padding: 1rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.tableearn td {
  vertical-align: middle;
  border: solid 1px #000;
  border-style: solid none;
  padding: 25px;
  background-color: black;
}
.tableearn td:first-child {
  border-left-style: solid;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
.tableearn td:last-child {
  border-right-style: solid;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
}
</style>

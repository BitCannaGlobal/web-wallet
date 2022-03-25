<template>
  <div class="container2">
    <h1>Pooling</h1>
    <table class="tableearn">
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <thead>
        <tr>
          <th class="cell"></th>
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
          <td class="cell">
            <img src="icon/BCNA-Atom.svg" />
          </td>
          <td class="cell">1-7-14 days</td>
          <td class="cell">${{ tvlData572 | bigFigureOrShortDecimals }}</td>
          <td class="cell">{{ apr572 }}% + {{ bonus572 }}% BONUS BCNA</td>
          <td class="cell">
            <CommonButton
              :href="network.osmosAppUrl + '/pool/572'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
        <tr>
          <td class="cell">BCNA/OSMO</td>
          <td class="cell">
            <img src="icon/BCNA-Osmo.svg" width="80" height="45" />
          </td>
          <td class="cell">1-7-14 days</td>
          <td class="cell">${{ tvlData571 | bigFigureOrShortDecimals }}</td>
          <td class="cell">{{ apr571 }}% + {{ bonus571 }}% BONUS BCNA</td>
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
    <br />
    <h1>Stake</h1>
    <table class="tableearn">
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <thead>
        <tr>
          <th class="cell index"></th>
          <th class="cell"></th>
          <th class="cell">Lockup</th>
          <th class="cell">TVL</th>
          <th class="cell">APR</th>
          <th class="cell"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell">BitCanna Delegate</td>
          <td class="cell">
            <img src="icon/BCNA-icon.svg" width="45" height="45" />
          </td>
          <td class="cell">14 days</td>
          <td class="cell">
            ${{ returnBcnaBonded | bigFigureOrShortDecimals }}
          </td>
          <td class="cell">
            {{ bcnaApr | bigFigureOrShortDecimals }}% (excl. commission)
            <!-- <nuxt-link to="/earn" @click.native="hi">
              <i class="material-icons">help</i>
            </nuxt-link> -->
          </td>
          <td class="cell noel">
            <nuxt-link to="/validators" class="li-session">
              <CommonButton value="Start earning" />
            </nuxt-link>
          </td>
        </tr>
        <tr>
          <td class="cell">BitCanna Validate</td>
          <td class="cell">
            <img src="icon/BCNA-icon.svg" width="45" height="45" />
          </td>
          <td class="cell">NA</td>
          <td class="cell">
            ${{ returnBcnaBonded | bigFigureOrShortDecimals }}
          </td>
          <td class="cell">
            {{ bcnaApr | bigFigureOrShortDecimals }}% (excl. commission)
            <!-- <i class="material-icons">help</i> -->
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
    apr571: '',
    apr572: '',
    bonus571: '',
    bonus572: '',
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
      'https://api-osmosis.imperator.co/pools/v2/571'
    )
    this.tvlData571 = responseData571.data[0].liquidity

    // Pool 572
    const responseData572 = await axios.get(
      'https://api-osmosis.imperator.co/pools/v2/572'
    )
    this.tvlData572 = responseData572.data[0].liquidity

    // Apr 571
    const aprData572 = await axios.get(
      'https://api-osmosis.imperator.co/apr/v2/572'
    )
    this.apr572 = aprData572.data[0].apr_list[1].apr_14d.toFixed(2)

    // Apr 571
    const aprData571 = await axios.get(
      'https://api-osmosis.imperator.co/apr/v2/571'
    )
    this.apr571 = aprData571.data[0].apr_list[1].apr_14d.toFixed(2)
    // you take the total liquidity of the pool (1.75M)
    // and the bonus rewards (2.4M)
    // (((((2.4M * 0.14) / 180) / 1.75M) * 365) * 100)
    // console.log(this.bcnaValue)
    const finalBonus571 = (
      ((1600000 * this.bcnaValue) / 180 / responseData571.data[0].liquidity) *
      365 *
      100
    ).toFixed(2)
    this.bonus571 = finalBonus571

    const finalBonus572 = (
      ((2400000 * this.bcnaValue) / 180 / responseData572.data[0].liquidity) *
      365 *
      100
    ).toFixed(2)
    this.bonus572 = finalBonus572
    console.log(responseData572.data[0].liquidity)
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
.container2 > h1 {
  font-size: 24px;
  color: #fff;
  color: var(--white);
  font-weight: 600;
  padding-bottom: 1rem;
}
.icon {
  display: inline-flex;
  align-self: center;
}

.tableearn {
  table-layout: fixed;
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
  padding: 15px;
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

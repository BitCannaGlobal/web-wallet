<template>
  <div v-if="step === 'Step 1'">
    <h2 class="session-title">Swap</h2>
    <CommonSteps :steps="steps" :active-step="step" />
    <CommonForm :submit="onSubmit" class="session-container">
      <div class="paragraph content">
        It is mandatory to swap your BCNA coins from the old BitCanna blockchain
        to the new blockchain.
      </div>
      <div class="paragraph content">
        Swapping your coins only requires 3 steps. Before you start, make sure
        you you you have your BitCanna wallet (old blockchain) open and are
        ready to your coins.
      </div>
      <div class="paragraph step-content">
        <span class="bold"
          >Step 1: Confirm that the address below is the right address to
          receive your (new) BCNA coins.</span
        >
      </div>
      <div class="session-main bottom-indent">
        <CommonField
          id="cosmos-address"
          v-model="cosmosAddress"
          v-focus
          type="text"
          placeholder="cosmos address"
          value="123"
        />
        <CommonFormMessage
          v-if="$v.cosmosAddress.$error && !$v.cosmosAddress.required"
          name="CosmosAddress"
          type="required"
        />
        <CommonFormMessage
          v-if="$v.cosmosAddress.$error && !$v.cosmosAddress.minLength"
          name="CosmosAddress"
          type="minLength"
          min="10"
        />
        <CommonFormMessage
          v-if="requestError"
          type="custom"
          :msg="requestError"
        />
      </div>
      <div class="session-footer first-step">
        <CommonButton value="Confirm" :disabled="loading" />
      </div>
    </CommonForm>
  </div>
  <div v-else-if="step === 'Step 2'">
    <h2 class="session-title">Swap</h2>
    <CommonSteps :steps="steps" :active-step="step" />
    <div class="session-container">
      <div class="paragraph content">
        Below, you will find a unique deposit address generated on the
        <span class="bold">old</span> BitCanna blockchain. To receive your
        <span class="bold">new</span> BCNA coins, you must send your
        <span class="bold">old</span> BCNA coins to this unique deposit address.
      </div>
      <div class="paragraph content">
        <ul>
          <li>• You can perform multiple transactions if you wish</li>
          <li>
            • You will receive the exact same amount of coins on the address
            confirmed in Step 1
          </li>
        </ul>
      </div>
      <div class="paragraph step-content">
        <span class="bold"
          >Step 2: Send your old BCNA coins to the unique deposit address
          below.</span
        ><br />
        Once you have sent your coins, click the “Check TX” button below.
      </div>
      <div class="copyable-bitcoin-address">
        <CommonField
          id="bitcoin-address"
          v-model="bitcoinAddress"
          v-focus
          type="text"
          placeholder=""
          value="bitcoinAddress"
          is-disabled
        />
        <div
          v-clipboard:copy="bitcoinAddress"
          v-clipboard:success="() => onCopy()"
          class="address"
        >
          <span><i class="material-icons notranslate">content_copy</i></span>
        </div>
        <div
          :class="{ active: copySuccess }"
          class="copy-bitcoin-address-tooltip hide"
        >
          <div class="arrow"></div>
          <div class="inner">Address Copied!</div>
        </div>
      </div>

      <div class="paragraph content support">
        If you still haven’t received your coins, send your new Cosmos address
        and your transaction hash to
        <a href="mailto:support@bitcanna.io">support@bitcanna.io</a>.
      </div>

      <div class="session-footer second-step">
        <CommonButton value="Back" type="secondary" @click.native="onBack" />
        <CommonButton
          :href="network.bitcannaExplorerURL + '/address/' + bitcoinAddress"
          value="Check TX"
          :link="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'
import network from '~/network'
import { getExchangeWallet } from '~/common/exchange'

const steps = [`Step 1`, `Step 2`]

export default {
  name: `PageSwap`,
  middleware: ['addressRequired', 'swapEnabled'],
  data: () => ({
    network,
    steps,
    step: 'Step 1',
    bitcoinAddress: undefined,
    cosmosAddress: undefined,
    loading: false,
    requestError: false,
    copySuccess: false,
  }),
  computed: {
    ...mapState(['session']),
  },
  created() {
    if (this.session) {
      this.cosmosAddress = this.session.address
    }
  },
  methods: {
    onBack() {
      const stepIndex = steps.findIndex((step) => step === this.step)
      if (stepIndex === 0) return this.$router.go(-1)
      this.errorMessage = undefined
      this.step = steps[stepIndex - 1]
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.loading = true
      const exchangeWallet = await getExchangeWallet(this.cosmosAddress)

      if (exchangeWallet.error) {
        this.requestError = exchangeWallet.error
      } else {
        this.bitcoinAddress = exchangeWallet.input_bitcoin_address
        this.requestError = false
      }

      this.loading = false
      this.step = `Step 2`
    },
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    },
  },
  validations() {
    return {
      cosmosAddress: { required, minLength: minLength(10) },
    }
  },
}
</script>

<style>
.paragraph {
  margin-bottom: 15px;
  letter-spacing: 0.32px;
}
.content {
  font-size: 16px;
  font-weight: 200;
}
.content.support {
  font-size: 14px;
}
.step-content {
  font-size: 14px;
}
.bold {
  font-weight: bold;
}
.session-footer.second-step {
  display: flex;
  justify-content: space-between;
}
.copyable-bitcoin-address {
  position: relative;
  margin-bottom: 20px;
  margin-top: 20px;
}
.copyable-bitcoin-address .address {
  position: absolute;
  top: 7px;
  right: 12px;
  cursor: pointer;
  color: var(--link);
}
.copyable-bitcoin-address .address i {
  font-size: 16px;
}
.copyable-bitcoin-address .address:hover {
  color: var(--link-hover);
}
.copy-bitcoin-address-tooltip {
  position: absolute;
  opacity: 0;
}

.copy-bitcoin-address-tooltip .inner {
  border-radius: 5px;
  background: var(--success);
  color: white;
  padding: 7px 10px;
  text-align: center;
  margin-top: 10px;
}

.copy-bitcoin-address-tooltip .arrow {
  left: 60px;
  width: 13px;
  height: 13px;
  background: var(--success);
  transform: rotate(45deg);
  top: 4px;
  position: absolute;
}

.copy-bitcoin-address-tooltip.active {
  opacity: 1;
  right: 0;
}
</style>

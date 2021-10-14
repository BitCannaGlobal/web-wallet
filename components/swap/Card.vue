<template>
  <div v-if="step === 'Step 1'">
    <h2 class="session-title">Swap</h2>
    <CommonSteps :steps="steps" :active-step="step" />
    <CommonForm :submit="onSubmit" class="session-container">
      <div class="paragraph content">
        It is mandatory to swap your BCNA coins from the
        <span class="bold">old</span> BitCanna blockchain to the
        <span class="bold">new</span> blockchain. Swapping your coins only
        requires 2 steps.
      </div>
      <div class="paragraph content">
        Before you start make sure you have your BitCanna wallet (<span
          class="bold"
          >old</span
        >
        blockchain) open to send your coins.
      </div>
      <div class="paragraph step-content">
        <span class="bold"
          >Step 1: Confirm that the address below is your new BCNA (Cosmos)
          address</span
        >
        (see top left corner in the web wallet) to receive your
        <span class="bold">new</span> BCNA coins.
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
      <div class="paragraph content confirmation">
        <br />
        By confirming your address and clicking the "Confirm" button, you
        expressly warrant to us that you have read our token swap
        <a
          href="https://bit.ly/3vcaT66"
          target="_blank"
          >terms & conditions</a
        >, that you understand its contents and that you agree with the
        applicability thereof on the token swap.
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
        Below, you’ll find a unique deposit address generated on the
        <span class="bold">old</span> BitCanna blockchain.
      </div>
      <div class="paragraph content">
        To receive your new BCNA coins, you must send your
        <span class="bold">old</span> BCNA coins to this unique
        <span class="bold">(old)</span> deposit address.
      </div>
      <div class="paragraph content">
        You can perform multiple transactions if you wish. You will receive the
        same amount (1:1) of coins on the address which you confirmed in Step 1
      </div>
      <div class="paragraph step-content">
        <span class="bold"
          >Step 2: Send your old BCNA coins to the unique deposit address
          below.</span
        ><br />
        Once you have sent your coins, you’ll receive the
        <span class="bold">new</span> BCNA coins in the web wallet
        <span class="bold">within 10 minutes</span>.
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
      <div class="paragraph content">
        Mobile wallet users can scan the QR-code to avoid copying the deposit
        address to send their coins.
      </div>
      <div class="qr-code-box">
        <qrcode-vue :value="bitcoinAddress" size="150" level="L"></qrcode-vue>
      </div>

      <div class="paragraph content">
        Click the “View address” button to track if your coins have been
        received on your <span class="bold">new</span> BCNA address.
      </div>

      <div class="paragraph content support">
        Haven’t received anything after 10 minutes? Contact us at
        <a href="mailto:support@bitcanna.io">support@bitcanna.io</a>; make sure
        to provide your new BCNA address, and/or your transaction hash. (You can
        copy the address by clicking on the address in the top left corner of
        your web wallet)
      </div>

      <div class="session-footer second-step">
        <CommonButton value="Back" type="secondary" @click.native="onBack" />
        <CommonButton
          :href="network.explorerURL + '/accounts/' + cosmosAddress"
          value="View address"
          :link="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'
import QrcodeVue from 'qrcode.vue'
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
  // eslint-disable-next-line vue/order-in-components
  components: {
    QrcodeVue,
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
      if (this.requestError === false) {
        this.step = `Step 2`
      }
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

.qr-code-box {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.first-step {
  padding-top: 0 !important;
}

.confirmation {
  font-size: 14px;
  font-style: italic;
}
</style>

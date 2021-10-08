<template>
  <div>
    <div class="session-back">
      <a @click="onBack">
        <i class="material-icons notranslate circle back">arrow_back</i>
      </a>
    </div>
    <CommonSteps :steps="steps" :active-step="step" />
    <AddressNameStep v-if="step === 'Name'" :name="name" @submit="setName" />
    <AddressPasswordStep
      v-if="step === 'Password'"
      :password="password"
      @submit="setPassword"
    />
    <AddressNewSeedStep
      v-if="step === 'Backup'"
      :seed="seed"
      @submit="setSeed"
    />
    <AddressImportSeedStep
      v-if="step === 'Confirm'"
      title="Confirm seed phrase"
      @submit="confirmSeed"
    />
    <CommonFormMessage v-if="errorMessage" type="custom" :msg="errorMessage" />
  </div>
</template>

<script>
import { getHDPath } from '~/common/hdpath'
import { storeWallet } from '~/common/keystore'
import network from '~/common/network'

const steps = [`Name`, `Password`, `Backup`, `Confirm`]

export default {
  name: `SessionCreate`,
  layout: 'session',
  middleware: 'localSigning',
  data: () => ({
    steps,
    step: 'Name',
    name: undefined,
    password: undefined,
    seed: undefined,
    errorMessage: undefined,
    loading: false,
  }),
  methods: {
    onBack() {
      const stepIndex = steps.findIndex((step) => step === this.step)
      if (stepIndex === 0) return this.$router.go(-1)
      this.errorMessage = undefined
      this.step = steps[stepIndex - 1]
    },
    setName(name) {
      this.name = name
      this.step = `Password`
    },
    setPassword(password) {
      this.password = password
      this.step = `Backup`
    },
    setSeed(seed) {
      this.seed = seed
      this.step = `Confirm`
    },
    confirmSeed(seed) {
      if (this.seed !== seed) {
        this.errorMessage =
          'The backup code you entered is incorrect. Please go back and write down your backup code.'
        return
      }
      this.onSubmit()
    },
    async onSubmit() {
      if (this.loading) return

      this.loading = true
      this.errorMessage = undefined
      try {
        const { Secp256k1HdWallet } = await import('@cosmjs/launchpad')
        const wallet = await Secp256k1HdWallet.fromMnemonic(
          this.seed,
          await getHDPath(network.HDPath),
          network.addressPrefix
        )
        storeWallet(
          await wallet.serialize(this.password),
          wallet.address,
          this.name,
          network.HDPath
        )
        this.$store.dispatch('signIn', {
          address: wallet.address,
          sessionType: 'local',
        })
        this.$router.push({
          name: 'index',
        })
      } catch (error) {
        this.loading = false
        this.errorMessage = error.message
      }
    },
  },
}
</script>

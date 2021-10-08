<template>
  <div>
    <CommonForm :submit="onSubmit" class="session-container">
      <h2 class="session-title">Sign in with account</h2>
      <div class="session-main bottom-indent">
        <CommonFormGroup field-id="sign-in-name" field-label="Select Account">
          <CommonField
            id="sign-in-name"
            v-model="signInAddress"
            v-focus
            :options="accounts"
            type="select"
            placeholder="Select account…"
          />
          <CommonFormMessage
            v-if="$v.signInAddress.$error && !$v.signInAddress.required"
            name="Name"
            type="required"
          />
        </CommonFormGroup>

        <CommonFormGroup
          :error="$v.signInPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <CommonField
            id="sign-in-password"
            v-model="signInPassword"
            type="password"
          />
          <CommonFormMessage
            v-if="$v.signInPassword.$error && !$v.signInPassword.required"
            name="Password"
            type="required"
          />
          <CommonFormMessage
            v-if="$v.signInPassword.$error && !$v.signInPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
          <CommonFormMessage v-if="error" type="custom" :msg="error" />
        </CommonFormGroup>
      </div>
      <div class="session-footer">
        <CommonButton value="Sign In" :disabled="loading" :loading="loading" />
      </div>
    </CommonForm>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { getWallet, getWalletIndex } from '~/common/keystore'

export default {
  name: `SessionSignIn`,
  layout: 'session',
  middleware: 'localSigning',
  data: () => ({
    signInAddress: undefined,
    signInPassword: ``,
    error: ``,
    loading: false,
  }),
  computed: {
    accounts() {
      if (process.client) {
        const accounts = getWalletIndex()
        return accounts.map(({ name, address }) => ({
          value: address,
          key: name,
        }))
      }
      return []
    },
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.loading = true

      try {
        const { Secp256k1HdWallet } = await import('@cosmjs/launchpad')
        const { wallet } = getWallet(this.signInAddress)
        await Secp256k1HdWallet.deserialize(wallet, this.signInPassword)
        this.$store.dispatch('signIn', {
          address: this.signInAddress,
          sessionType: 'local',
        })
        this.$router.push('/')
      } catch (err) {
        this.loading = false
        this.error = `The provided username or password is wrong.`
      }
    },
  },
  validations() {
    return {
      signInAddress: { required },
      signInPassword: { required, minLength: minLength(10) },
    }
  },
}
</script>

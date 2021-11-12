<template>
  <ModalAction
    id="redelegation-modal"
    ref="ModalAction"
    :validate="validateForm"
    :amounts="[]"
    title="Redelegate"
    class="redelegation-modal"
    submission-error-prefix="Unstaking failed"
    :transaction-type="lunieMessageTypes.UNDELEGATE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="undelegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <CommonFormGroup
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <CommonField
        id="from"
        :value="enhancedSourceValidator"
        type="text"
        readonly
      />
    </CommonFormGroup>
    <CommonFormGroup
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <CommonField id="to" v-model="to" type="text" />
    </CommonFormGroup>
    <CommonFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <div class="row">
        <CommonField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <CommonButton
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </div>
      <span class="form-message">
        Currently staked: {{ maximum }} {{ stakingDenom }}
      </span>
      <CommonFormMessage
        v-if="maximum === '0'"
        :msg="`doesn't have any ${network.stakingDenom}s`"
        name="Wallet"
        type="custom"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${stakingDenom} to proceed.`"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
      <CommonFormMessage
        v-else-if="$v.to.$error && !$v.to.required"
        name="Provide"
        type="validatorRequired"
      />
      <CommonFormMessage
        v-else-if="$v.to.$error && !$v.to.isValidatorAddress"
        name="The provided address"
        type="isValidator"
      />
    </CommonFormGroup>
  </ModalAction>
</template>

<script>
import { mapState } from 'vuex'
import { required, decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '~/common/numbers'
import { validatorEntry } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `Restake`,
  filters: {
    validatorEntry,
  },
  props: {
    sourceValidator: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    amount: null,
    to: null,
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    stakingDenom: network.stakingDenom,
    network,
  }),
  computed: {
    ...mapState(`data`, [`delegations`]),
    ...mapState(['session']),
    maximum() {
      const delegation = this.delegations.find(
        ({ validator }) =>
          validator.operatorAddress === this.sourceValidator.operatorAddress
      )
      return delegation ? Number(delegation.amount) : 0
    },
    transactionData() {
      if (this.session) {
        return {
          type: lunieMessageTypes.RESTAKE,
          from:
            this.sourceValidator && this.sourceValidator.operatorAddress
              ? [this.sourceValidator.operatorAddress]
              : null,
          amount: {
            amount: this.amount,
            denom: this.stakingDenom,
          },
          to: [this.to],
          delegator: [this.session.address],
        }
      } else {
        return {}
      }
    },
    notifyMessage() {
      return {
        title: `Successfully redelegate!`,
        body: `You have successfully redelegate ${this.amount} ${this.stakingDenom}.`,
      }
    },
    undelegationPeriod() {
      return network.lockUpPeriod
    },
    enhancedSourceValidator() {
      return validatorEntry(this.sourceValidator)
    },
  },
  validations() {
    return {
      amount: {
        required,
        decimal,
        max: (x) => Number(x) <= this.maximum,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          return Number(x).toString().split('.').length > 1
            ? Number(x).toString().split('.')[1].length <= 6
            : true
        },
      },
      to: {
        required,
        isValidatorAddress: () => {
          if (this.to !== null && this.to.startsWith('bcnavaloper')) {
            return true
          } else {
            return false
          }
        },
      },
    }
  },
  methods: {
    open() {
      this.$refs.ModalAction.open()
    },
    validateForm() {
      this.$v.$touch()
      console.log(this.$v.$invalid)
      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()
      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maximum
    },
    enterPressed() {
      this.$refs.ModalAction.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
}
</script>

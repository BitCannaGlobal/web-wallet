<template>
  <ModalAction
    id="modal-deposit"
    ref="ModalAction"
    :validate="validateForm"
    :amount="amount"
    title="Deposit"
    class="modal-deposit"
    submission-error-prefix="Depositing failed"
    :transaction-type="lunieMessageTypes.DEPOSIT"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="deposit"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <CommonFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <CommonField
        id="amount"
        v-model="amount"
        v-focus
        :disabled="network.network_type === `polkadot`"
        type="number"
        placeholder="0"
      />
      <CommonFormMessage
        v-if="balance.available === '0'"
        :msg="`doesn't have any ${network.stakingDenom}`"
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
        :msg="`You don't have enough ${network.stakingDenom} to proceed.`"
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
    </CommonFormGroup>
  </ModalAction>
</template>

<script>
import { mapState } from 'vuex'
import { decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '~/common/numbers'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `ModalDeposit`,
  props: {
    proposalId: {
      type: [Number, String],
      required: true,
    },
    proposalTitle: {
      type: String,
      required: true,
    },
    denom: {
      type: String,
      required: true,
    },
    deposits: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    amount: null,
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    network,
  }),
  computed: {
    ...mapState(`data`, [`balances`]),
    balance() {
      console.log(
        this.balances.find(({ denom }) => denom === network.stakingDenom)
      )
      return (
        this.balances.find(({ denom }) => denom === network.stakingDenom) || {
          available: 0,
          denom: network.stakingDenom,
        }
      )
    },
    maxAmount() {
      return this.balance.available
    },
    transactionData() {
      if (isNaN(this.amount) || !this.proposalId || !this.denom) {
        return {}
      }
      return {
        type: lunieMessageTypes.DEPOSIT,
        proposalId: this.proposalId,
        amount: {
          amount: this.amount,
          denom: this.denom,
        },
        depositsCount: this.deposits.length,
      }
    },
    notifyMessage() {
      return {
        title: `Successful deposit!`,
        body: `You have successfully deposited your ${this.denom}s on proposal #${this.proposalId}`,
      }
    },
  },
  validations() {
    return {
      amount: {
        required: (x) => !!x && x !== `0`,
        decimal,
        max: (x) => Number(x) <= this.maxAmount,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          if (x) {
            return x.toString().split('.').length > 1
              ? x.toString().split('.')[1].length <= 6
              : true
          } else {
            return false
          }
        },
      },
    }
  },
  methods: {
    open() {
      if (this.network.network_type === `polkadot`) {
        this.amount = this.deposits[0].amount[0].amount
      }
      this.$refs.ModalAction.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.amount = 0
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
}
</script>

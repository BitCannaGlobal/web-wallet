<template>
  <div
    v-if="undelegations.length && undelegationsLoaded"
    class="table-container"
  >
    <h1>Unstaking</h1>
    <CommonTableContainer
      :length="undelegations.length"
      :columns="properties"
      :sort="sort"
      :loaded="undelegationsLoaded"
    >
      <StakingValidatorRow
        v-for="(undelegation, index) in sortedEnrichedValidators"
        :key="undelegation.validatorAddress + undelegation.startHeight"
        :index="index"
        :validator="undelegation.validator"
        :undelegation="undelegation"
      />
    </CommonTableContainer>
    <!-- <ModalWithdrawUnstaked ref="WithdrawModal" /> -->
  </div>
</template>

<script>
import { orderBy } from 'lodash'
import { mapState } from 'vuex'
import network from '~/network'

export default {
  name: `Undelegations`,
  data: () => ({
    sort: {
      property: `endTime`,
      order: `desc`,
    },
  }),
  computed: {
    ...mapState('data', ['undelegations', 'undelegationsLoaded']),
    sortedEnrichedValidators() {
      const orderedValidators = orderBy(
        this.undelegations.map((validator) => ({
          ...validator,
          smallName: validator.name ? validator.name.toLowerCase() : '',
        })),
        [this.sort.property],
        [this.sort.order]
      )
      return orderedValidators
    },
    balances() {
      return this.undelegations.map((undelegation) => {
        return {
          ...undelegation,
          total: undelegation.amount,
          denom: network.stakingDenom,
        }
      })
    },
    readyUndelegations() {
      const now = new Date()
      return !!this.undelegations.find(({ endTime }) => {
        return new Date(endTime) <= now
      })
    },
    properties() {
      return [
        {
          title: `Status`,
          value: `status`,
        },
        {
          title: `Name`,
          value: `smallName`,
        },
        {
          title: `End Time`,
          value: `endTime`,
        },
      ]
    },
  },
  methods: {
    onWithdraw() {
      this.$refs.WithdrawModal.open()
    },
  },
}
</script>
<style scoped>
.table-container {
  margin: 0 auto;
  width: 100%;
  padding: 3rem 1.5rem;
  background: var(--gray-1200);
}

@media screen and (max-width: 1023px) {
  .table-container {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

@media screen and (max-width: 667px) {
  .table-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>

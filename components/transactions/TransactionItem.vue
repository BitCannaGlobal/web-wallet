<template>
  <div class="tx-container">
    <a
      class="transaction"
      :href="network.bitcannaExplorerURL + '/transactions/' + transaction.hash"
      target="_blank"
      rel="nofollow noreferrer noopener"
    >
      <div class="left">
        <div class="icon" :style="`background-image: url(${imagePath})`"></div>
        <div class="title-and-images">
          <div>
            <h3>{{ transactionCaption }}</h3>
            <template v-if="transactionCaption === `Send`">
              <p
                v-for="(address, index) in transaction.details.to"
                :key="address + index"
              >
                {{ address }}
              </p>
            </template>
            <template v-if="transactionCaption === `Receive`">
              <p
                v-for="(address, index) in transaction.details.from"
                :key="address + index"
              >
                {{ address }}
              </p>
            </template>
          </div>
          <div v-if="includesValidatorAddresses" class="validator-images">
            <template v-for="(address, index) in transaction.details.from">
              <CommonAvatar
                :key="index + '_from_avatar'"
                class="validator-image"
                alt="placeholder color for validator image"
                :address="address"
                @click.prevent.self
                @click="$router.push(`/validators/${address}`)"
              />
            </template>
            <template v-for="(address, index) in transaction.details.to">
              <CommonAvatar
                :key="index + '_to_avatar'"
                class="validator-image"
                alt="placeholder color for validator image"
                :address="address"
                @click.prevent.self
                @click="$router.push(`/validators/${address}`)"
              />
            </template>
          </div>
        </div>
      </div>
      <div class="right">
        <div v-if="amounts" class="amounts">
          <p v-for="(item, index) in amounts" :key="index">
            {{ item.amount | prettyLong }}
            {{ item.denom }}
          </p>
        </div>
        <div class="launch">
          <i class="material-icons notranslate launch-icon">launch</i>
        </div>
      </div>
    </a>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import { prettyLong } from '~/common/numbers'
import network from '~/common/network'

export default {
  name: `Transaction`,
  filters: {
    prettyLong,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    network,
  }),
  computed: {
    ...mapState(['session']),
    transactionCaption() {
      switch (this.transaction.type) {
        case lunieMessageTypes.SEND:
          if (this.transaction.details.to.includes(this.session.address)) {
            return 'Receive'
          } else {
            return 'Send'
          }
        case lunieMessageTypes.STAKE:
          return `Stake`
        case lunieMessageTypes.RESTAKE:
          return `Restake`
        case lunieMessageTypes.UNSTAKE:
          return `Unstake`
        case lunieMessageTypes.DEPOSIT:
          return `Deposit`
        case lunieMessageTypes.VOTE:
          return `Vote`
        case lunieMessageTypes.SUBMIT_PROPOSAL:
          return `Proposal`
        case lunieMessageTypes.CLAIM_REWARDS:
          return `Claim Rewards`
        case lunieMessageTypes.EDIT_VALIDATOR:
          return `Edit validator`
        case lunieMessageTypes.CREATE_VALIDATOR:
          return `Create validator`
        case lunieMessageTypes.IBC:
          return `IBC`
        case lunieMessageTypes.FUND_COMMUNITY_POOL:
          return `Fund Community Pool`
        case lunieMessageTypes.UNJAIL:
          return `Unjail`
        case lunieMessageTypes.UNKNOWN:
          return this.transaction.rawMessage.message['@type'].split('/')[1]
        default:
          return ``
      }
    },
    imagePath() {
      switch (this.transaction.type) {
        case lunieMessageTypes.SEND:
          if (this.transaction.details.to.includes(this.session.address)) {
            return require(`../../assets/images/transactions/Receive.svg`)
          } else {
            return require(`../../assets/images/transactions/Send.svg`)
          }
        case lunieMessageTypes.STAKE:
          return require(`../../assets/images/transactions/Stake.svg`)
        case lunieMessageTypes.RESTAKE:
          return require(`../../assets/images/transactions/Restake.svg`)
        case lunieMessageTypes.UNSTAKE:
          return require(`../../assets/images/transactions/Unstake.svg`)
        case lunieMessageTypes.DEPOSIT:
          return require(`../../assets/images/transactions/Deposit.svg`)
        case lunieMessageTypes.VOTE:
        case lunieMessageTypes.SUBMIT_PROPOSAL:
        case lunieMessageTypes.EDIT_VALIDATOR:
        case lunieMessageTypes.CREATE_VALIDATOR:
        case lunieMessageTypes.IBC:
        case lunieMessageTypes.UNJAIL:
          return require(`../../assets/images/transactions/Proposal.svg`)
        case lunieMessageTypes.CLAIM_REWARDS:
          return require(`../../assets/images/transactions/ClaimRewards.svg`)
        case lunieMessageTypes.FUND_COMMUNITY_POOL:
          return require(`../../assets/images/transactions/Receive.svg`)
        case lunieMessageTypes.UNKNOWN:
          return require(`../../assets/images/transactions/Unknown.svg`)
        default:
          return require(`../../assets/images/transactions/Unknown.svg`)
      }
    },
    includesValidatorAddresses() {
      return [
        lunieMessageTypes.STAKE,
        lunieMessageTypes.UNSTAKE,
        lunieMessageTypes.RESTAKE,
        lunieMessageTypes.CLAIM_REWARDS,
      ].includes(this.transaction.type)
    },
    amounts() {
      if (this.transaction.details.amounts) {
        return this.transaction.details.amounts
      } else if (this.transaction.details.amount) {
        return [this.transaction.details.amount]
      }
      return null
    },
  },
}
</script>

<style scoped>
.transaction {
  position: relative;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gray-1100);
  border-radius: var(--border-radius);
  z-index: 90;
  padding: 0.75rem 1rem;
  margin: 1rem 1.5rem 0 1.5rem;
  cursor: pointer;
}

.icon {
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 50%;
  display: inline-flex;
  background-color: var(--gray-300);
  background-size: contain;
}

.transaction:hover {
  background: var(--gray-1300);
}

.left {
  display: flex;
  flex-direction: row;
}

.title-and-images {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-and-images p {
  color: var(--gray-500);
  padding: 0 2rem 0 1rem;
  font-size: var(--text-xs);
  word-break: break-all;
}

.validator-images {
  padding: 0 0 0 1rem;
  display: inline-flex;
}

.validator-images img {
  height: 1.25rem;
  width: 1.25rem;
}

.right {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h3 {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--txt);
  padding-left: 1rem;
}

.amounts {
  color: var(--txt);
  font-size: var(--text-sm);
}

.validator-image {
  height: 1.25rem;
  width: 1.25rem;
  margin: 0 0.5rem 0 0;
  border-radius: 50%;
}

.launch {
  z-index: 91;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  transition: transform 0.2s ease;
  margin-left: 1rem;
}

.launch i {
  font-size: 16px;
  position: relative;
  color: var(--link);
  top: 1px;
}

@media screen and (max-width: 767px) {
  .title-and-images {
    flex-direction: column;
    align-items: start;
  }

  .title-and-images p {
    padding-left: 0;
  }

  h3 {
    padding-left: 0;
  }

  .amounts {
    text-align: right;
  }

  .validator-images {
    padding: 0.5rem 0 0 0;
  }

  .icon {
    display: none;
  }

  .launch {
    display: none;
  }
}
</style>

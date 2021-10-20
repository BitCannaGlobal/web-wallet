<template>
  <div>
    <div v-if="!proposalsLoaded && !proposal">
      <CommonLoader />
    </div>
    <div v-else class="proposal">
      <GovernanceProposalHeader
        :proposal="proposal"
        :status="status"
        @open-vote-modal="onVote"
        @open-deposit-modal="onDeposit"
      />

      <GovernanceProposalStatusBar
        v-if="tallyHasValues"
        :status="status"
        :status-begin-time="proposal.statusBeginTime"
        :total-votes="proposal.tally.total"
        :proposal="proposal"
      />

      <GovernanceParticipantList
        v-if="participants"
        :participants="participants"
        :show-amounts="true"
      />

      <template v-if="proposal.detailedVotes.timeline.length">
        <GovernanceTimeline :timeline="proposal.detailedVotes.timeline" />
      </template>

      <GovernanceProposalDescription :proposal="proposal" />

      <ModalDeposit
        v-if="status.value === governanceStatusEnum.DEPOSITING"
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :denom="parameters.depositDenom || network.stakingDenom"
        :deposits="proposal.detailedVotes.deposits"
        @success="() => afterVoteOrDeposit()"
      />
      <ModalVote
        v-else
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVoteOrDeposit()"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BigNumber from 'bignumber.js'
import { percent, prettyInt } from '~/common/numbers'
import { date, fromNow } from '~/common/time'
import {
  getProposalStatus,
  governanceStatusEnum,
} from '~/common/proposal-status'
import network from '~/common/network'

export default {
  name: `PageProposal`,
  filters: {
    prettyInt,
    percent,
    date,
    fromNow,
    lowerCase: (text) => (text ? text.toLowerCase() : ''),
  },
  data: () => ({
    vote: undefined,
    parameters: {
      depositDenom: '',
    },
    error: undefined,
    found: false,
    loaded: false,
    governanceStatusEnum,
    network,
  }),
  computed: {
    ...mapState('data', ['proposals', 'proposalsLoaded']),
    ...mapState(['session']),
    proposal() {
      if (this.proposals && this.proposals.length > 0) {
        return this.proposals.find(({ id }) => id === this.proposalId)
      } else {
        return null
      }
    },
    proposalId() {
      return Number(this.$route.params.id)
    },
    status() {
      return this.proposal ? getProposalStatus(this.proposal) : null
    },
    noVotes() {
      return BigNumber(this.proposal.tally.total).eq(0)
    },
    tallyHasValues() {
      return Object.values(this.proposal.tally)
        .filter((value) => value !== `Tally`)
        .find((value) => value)
    },
    participants() {
      if (
        this.proposal.detailedVotes.votes &&
        this.proposal.detailedVotes.votes.length > 0
      ) {
        return this.proposal.detailedVotes.votes.map((vote) => ({
          ...vote.voter,
          amount: vote.amount,
          option: vote.option,
        }))
      } else if (
        this.proposal.detailedVotes.deposits &&
        this.proposal.detailedVotes.deposits.length > 0
      ) {
        // a bit hacky but working
        return this.proposal.detailedVotes.deposits.map((deposit) => ({
          ...deposit.depositer,
          amount: deposit.amount[0],
        }))
      }
      return undefined
    },
  },
  methods: {
    onVote() {
      if (this.session.sessionType !== 'ledger') {
        this.$refs.modalVote.open()
      } else {
        this.$toast.error(
          'Voting through Ledger is currently not available in the web wallet.',
          {
            position: 'bottom-right',
            timeout: 5000,
            closeOnClick: true,
            showCloseButtonOnHover: false,
            hideProgressBar: false,
            closeButton: 'button',
            icon: true,
          }
        )
      }
    },
    afterVoteOrDeposit() {
      this.$store.dispatch('data/getProposals')
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    },
  },
}
</script>
<style scoped>
.proposal {
  margin: 2rem;
  padding: 1.5rem 2rem;
  border-radius: var(--border-radius);
  background: var(--gray-1100);
  max-width: 1024px;
}

@media screen and (max-width: 667px) {
  .proposal {
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    margin: 0;
  }
}

@media screen and (min-width: 1324px) {
  .proposal {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>

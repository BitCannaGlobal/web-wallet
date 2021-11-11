<template>
  <div class="proposals">
    <div v-if="!proposalsLoaded || !governanceOverviewLoaded">
      <CommonLoader />
    </div>
    <template v-else>
      <h3>Proposals</h3>
      <GovernanceProposalRow
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
      />

      <CommonCard v-if="!proposals.length">
        <div slot="title">No proposals</div>
        <div slot="subtitle">
          There are no proposals on this blockchain yet.
        </div>
      </CommonCard>

      <h3>Stats</h3>
      <div class="data-row">
        <div>
          <h4 class="icon">
            <img src="icon/pool.png" />
            &ensp; Community Pool
          </h4>
          <p class="text-block">
            {{ governanceOverview.treasurySize }}
            {{ network.stakingDenom }}
          </p>
        </div>
        <div>
          <h4 class="icon">
            <img src="icon/tokens.png" />
            &ensp; Bonded coins
          </h4>
          <p class="text-block">
            {{ governanceOverview.totalStakedAssets }}
            {{ network.stakingDenom }}
          </p>
        </div>
      </div>

      <h3>Voting Power</h3>
      <GovernanceParticipantList
        v-if="
          governanceOverview.topVoters &&
          governanceOverview.topVoters.length > 0
        "
        :participants="governanceOverview.topVoters"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/common/network'

export default {
  name: `Proposals`,
  data: () => ({
    network,
  }),
  computed: {
    ...mapState('data', [
      `proposals`,
      `governanceOverview`,
      `proposalsLoaded`,
      `governanceOverviewLoaded`,
    ]),
  },
}
</script>
<style scoped>
.icon {
  display: inline-flex;
  align-self: center;
}

.text-block {
  text-align: right;
}

.proposals {
  padding: 0 1.5rem 3rem;
}

h3 {
  font-size: 24px;
  color: var(--white);
  font-weight: 600;
  padding: 3rem 0 1.5rem;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-row div {
  font-size: 22px;
  color: var(--txt);
  padding: 1rem 1.5rem;
  width: 100%;
  white-space: nowrap;
  border-radius: var(--border-radius);
  background: var(--gray-1100);
}

.data-row div:first-child {
  margin-right: 1rem;
}

.proposals .card {
  margin: 0;
}

@media screen and (max-width: 1023px) {
  .proposals {
    padding: 1rem;
  }

  .data-row {
    flex-direction: column;
  }

  .data-row div:first-child {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>

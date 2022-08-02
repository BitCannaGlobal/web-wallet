/* eslint-disable */

import BigNumber from 'bignumber.js'
import { keyBy, orderBy, take, reverse, sortBy, chunk } from 'lodash'
import * as reducers from './cosmos-reducers'
import { encodeB32, decodeB32 } from '~/common/address'
import { urlSafeEncode } from '~/common/b64'
import { setDecimalLength } from '~/common/numbers'
import network from '~/common/network'

const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }
const PAGE_RECORDS_COUNT = 20
const GOLANG_NULL_TIME = `0001-01-01T00:00:00Z` // time that gets serialized from null in golang

export default class CosmosAPI {
  constructor(axios) {
    this.axios = axios // passed in here to use Nuxt $axios instance
    this.network = network
    this.reducers = reducers

    // system to stop queries to proceed if store data is not yet available
    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.getBlock(network.minBlockHeight).then(block => {
      this.firstBlock = block
    })
    this.loadValidators().then((validators) => {
      this.validators = keyBy(validators, 'operatorAddress')
      this.resolveReady()
    })

  }

  getChainStartTime() {
    return new Date(this.firstBlock.time)
  }

  dataExistsInThisChain(timestamp) {
    return new Date(timestamp) > this.getChainStartTime()
  }

  async get(url) {
    return await this.axios(
      network.apiURL + (url.startsWith('/') ? url : '/' + url)
    ).then((res) => res.data)
  }
  // querying data from the cosmos REST API
  // some endpoints /blocks and /txs have a different response format so they use this.get directly
  async query(url) {
    try {
      const response = await this.get(url)
      return response
    } catch (error) {
      console.error(
        `Error for query ${url} in network ${this.network.name} (tried 3 times)`
      )
      throw error
    }
  }

  async queryPaginate(url, key) {
    return await this.query(url + `?pagination.key=${key}`)
  }

  async queryAutoPaginate(url) {
    var data = await this.query(url)
    const keys = Object.keys(data)
    const fieldIndex = keys.indexOf("pagination") ? 0 : 1
    const fieldName = keys[fieldIndex]

    var paginatedData = data[fieldName]
    while (data.pagination != null && data.pagination.next_key != null) {
      data = await this.queryPaginate(url, urlSafeEncode(data.pagination.next_key))
      paginatedData = paginatedData.concat(data[fieldName])
    }
    return paginatedData
  }

  async getAccountInfo(address) {
    const accountInfo = await this.query(
      `cosmos/auth/v1beta1/accounts/${address}`
    )
    return {
      accountNumber: accountInfo.account.account_number,
      sequence: accountInfo.account.sequence || '0',
    }
  }

  async getAccountTxs(account) { // to be replaced
    return await axios.get(`https://api.cosmostation.io/v1/account/txs/${account}`)
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query(`/cosmos/slashing/v1beta1/params`)
    return slashingParams.params.signed_blocks_window
  }

  async getTransactions(address, pageNumber = 1) {
    // getting page count
    const [senderPage, recipientPage] = await Promise.all([
      this.getPageCount(`/cosmos/tx/v1beta1/txs?events=message.sender='${address}'`),
      this.getPageCount(`/cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'`),
    ])

    const requests = [
      this.loadPaginatedTxs(
        `/cosmos/tx/v1beta1/txs?events=message.sender='${address}'`,
        senderPage - pageNumber + 1
      ),
      this.loadPaginatedTxs(
        `/cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'`,
        recipientPage - pageNumber + 1
      ),
    ]
    // /*
    //   if it's a first requests we need to load two pages, instead of one,
    //   cause last page could contain less records than any other (even 1)
    //   To do this asynchronously we need to do it with Promise.all
    //   and not wait until last page is loaded
    // */
    if (pageNumber === 1) {
      if (senderPage - pageNumber > 0) {
        requests.push(
          this.loadPaginatedTxs(
            `/cosmos/tx/v1beta1/txs?events=message.sender='${address}'`,
            senderPage - pageNumber
          )
        )
      }
      if (recipientPage - pageNumber > 0) {
        requests.push(
          this.loadPaginatedTxs(
            `/cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'`,
            recipientPage - pageNumber
          )
        )
      }
    }

    const txs = await Promise.all(requests).then(([...results]) =>
      [].concat(...results)
    )

    return this.reducers.transactionsReducer(txs)
  }

  async getValidatorSigningInfos() {
    const signingInfos = await this.queryAutoPaginate(
      `cosmos/slashing/v1beta1/signing_infos`
    )
    return signingInfos
  }

  async getValidatorSet(height = 'latest') {
    const response = await this.queryAutoPaginate(
      `staking/validators?status=BOND_STATUS_BONDED`
    )
    return response
  }

  async getSelfStake(validator) {
    const hexDelegatorAddressFromOperator = decodeB32(validator.operatorAddress)
    const delegatorAddressFromOperator = encodeB32(
      hexDelegatorAddressFromOperator,
      this.network.addressPrefix
    )

    let selfDelegation
    try {
      selfDelegation = await this.query(
        `cosmos/staking/v1beta1/validators/${validator.operatorAddress}/delegations/${delegatorAddressFromOperator}`
      )
    } catch (error) {
      // in some rare cases the validator has no self delegation so this query fails

      if (error.response.status === 500) {
        const parsedErrorLog = JSON.parse(error.response.body.error)
        if (parsedErrorLog.message.startsWith('no delegation for this')) {
          return 0
        }
      }

      // still throw in every other unknown case
      throw error
    }

    return this.reducers.delegationReducer(
      selfDelegation.delegation_response,
      validator,
      delegationEnum.ACTIVE
    ).amount
  }

  async getValidatorInfoPage() {
    return await this.axios(`https://graphql.bitcanna.io/api/rest/supply/bonded`)
  }

  async getBcnaValue() {
    return await this.axios(`https://api.coingecko.com/api/v3/simple/price?ids=bitcanna&vs_currencies=usd`)
  }

  async getBcnaInflation() {
    return await this.axios(`https://graphql.bitcanna.io/api/rest/supply/inflation`)
  }
  async getBcnaApr() {
    // return await this.axios(`https://api.stakely.io/stats`)
    return await this.axios(`https://graphql.bitcanna.io/api/rest/price/apr`)
  }

  async getValidator(address) {
    await this.dataReady
    return this.validators[address]
  }

  async getValidators() {
    await this.dataReady
    return Object.values(this.validators)
  }
  async getStakingSupply() {
    const res = await this.query(`cosmos/bank/v1beta1/supply`)
    return BigNumber(res.supply[0].amount)
  }
  /* async loadValidators() {
    const [
      validators,
      validatorsUnbonding,
      // annualProvision,
      // supply,
      // pool
    ] = await Promise.all([
      this.query(`cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`),
      this.query(`cosmos/staking/v1beta1/validators?status=BOND_STATUS_UNBONDED`),
      // this.getAnnualProvision().catch(() => undefined),
      // this.getStakingSupply(),
      // this.query(`cosmos/staking/v1beta1/pool`)
    ])

    const resultValidators = validators.validators.concat(validatorsUnbonding.validators)

    const tokensTotal = resultValidators.reduce(function(prev, cur) {
      return prev + parseInt(cur.tokens);
    }, 0);

    return resultValidators.map(validator => reducers.validatorReducer(validator, tokensTotal))
  } */
  async loadValidators() {
    const [
      validators,
      validatorsUnbonding,
      validatorsUnbonded,
      // annualProvision,
      // supply,
      // pool
    ] = await Promise.all([
      this.query(`staking/validators?status=BOND_STATUS_BONDED`),
      this.query(`staking/validators?status=BOND_STATUS_UNBONDING`),
      this.query(`staking/validators?status=BOND_STATUS_UNBONDED`),
      // this.getAnnualProvision().catch(() => undefined),
      // this.getStakingSupply(),
      // this.query(`cosmos/staking/v1beta1/pool`)
    ])

    const resultValidators = validators.result.concat(validatorsUnbonding.result)
    const resultValidatorsFinal = resultValidators.concat(validatorsUnbonded.result)

    const tokensTotal = resultValidatorsFinal.reduce(function(prev, cur) {
      return prev + parseInt(cur.tokens);
    }, 0);
    return resultValidatorsFinal.map(validator => reducers.validatorReducer(validator, tokensTotal))
  }

  async getInflation() {
    const rate = await this.query(`cosmos/mint/v1beta1/inflation`)
    const params = await this.query(`cosmos/mint/v1beta1/params`)
    const annual_provisions = await this.query(`cosmos/mint/v1beta1/annual_provisions`)
  }

  async getDetailedVotes(proposal, tallyParams, depositParams) {
    await this.dataReady

    const dataAvailable = this.dataExistsInThisChain(proposal.submit_time)
    const votingComplete = ['PROPOSAL_STATUS_PASSED', 'PROPOSAL_STATUS_REJECTED'].includes(proposal.status)

    const votes = await this.queryAutoPaginate(`/cosmos/gov/v1beta1/proposals/${proposal.proposal_id}/votes`)
    const deposits = await this.queryAutoPaginate(`/cosmos/gov/v1beta1/proposals/${proposal.proposal_id}/deposits`)
    const tally = await this.query(`/cosmos/gov/v1beta1/proposals/${proposal.proposal_id}/tally`)

    const totalVotingParticipation = BigNumber(tally.yes)
      .plus(tally.abstain)
      .plus(tally.no)
      .plus(tally.no_with_veto)
    const formattedDeposits = deposits.length
      ? deposits.map((deposit) =>
        this.reducers.depositReducer(deposit, this.validators)
      )
      : []

    const depositsSum = deposits.length
      ? formattedDeposits.reduce((depositAmountAggregator, deposit) => {
        return (depositAmountAggregator += deposit.amount.length ? Number(deposit.amount[0].amount) : 0)
      }, 0)
      : []

    return {
      deposits: formattedDeposits,
      depositsSum: deposits.length ? Number(depositsSum).toFixed(6) : [],
      percentageDepositsNeeded: deposits
        ? percentage(
          depositsSum,
          BigNumber(depositParams.deposit_params.min_deposit[0].amount)
        )
        : [],
      votes: votes.length
        ? votes.map((vote) => this.reducers.voteReducer(vote, this.validators))
        : [],
      votesSum: votes ? votes.length : [],
      votingThresholdYes: Number(tallyParams.threshold).toFixed(2),
      votingThresholdNo: (1 - tallyParams.threshold).toFixed(2),
      votingPercentageYes: percentage(tally.yes, totalVotingParticipation),
      votingPercentageNo: percentage(
        BigNumber(tally.no).plus(tally.no_with_veto),
        totalVotingParticipation
      ),
      tally: tally,
      timeline: [
        proposal.submit_time
          ? { title: `Created`, time: proposal.submit_time }
          : undefined,
        proposal.deposit_end_time
          ? {
            title: `Deposit Period Ends`,
            // the deposit period can end before the time as the limit is reached already
            time:
              proposal.voting_start_time !== GOLANG_NULL_TIME &&
                new Date(proposal.voting_start_time) <
                new Date(proposal.deposit_end_time)
                ? proposal.voting_start_time
                : proposal.deposit_end_time,
          }
          : [],
        proposal.voting_start_time
          ? {
            title: `Voting Period Starts`,
            time:
              proposal.voting_start_time !== GOLANG_NULL_TIME
                ? proposal.voting_start_time
                : [],
          }
          : [],
        proposal.voting_end_time
          ? {
            title: `Voting Period Ends`,
            time:
              proposal.voting_end_time !== GOLANG_NULL_TIME
                ? proposal.voting_end_time
                : [],
          }
          : [],
      ].filter((x) => !!x),
    }
  }

  // we can't query the proposer of blocks from past chains
  async getProposer(proposal) {
    let proposer = { proposer: undefined }
    const proposalExistsOnCurrentChain = this.firstBlock.chainId == this.network.chainId
    if (!proposalExistsOnCurrentChain) {
      proposer = await this.query(
        `/cosmos/gov/v1beta1/proposals/${proposal.proposal_id}/proposer`
      )
    }
    return proposer
  }

  async getProposals() {
    await this.dataReady
    const [
      proposalsResponse,
      pool,
      tallyParams,
      depositParams,
    ] = await Promise.all([
      this.queryAutoPaginate('cosmos/gov/v1beta1/proposals'),
      this.query('cosmos/staking/v1beta1/pool'),
      this.query(`/cosmos/gov/v1beta1/params/tallying`),
      this.query(`/cosmos/gov/v1beta1/params/deposit`)
    ])
    if (!Array.isArray(proposalsResponse)) return []

    const proposals = await Promise.all(
      proposalsResponse.map(async (proposal) => {
        const detailedVotes = await this.getDetailedVotes(
          proposal,
          tallyParams,
          depositParams,
        )
        return this.reducers.proposalReducer(
          proposal,
          pool.pool.bonded_tokens,
          detailedVotes,
        )
      })
    )

    return orderBy(proposals, 'id', 'desc')
  }

  async getTopVoters() {
    await this.dataReady
    // for now defaulting to pick the 10 largest voting powers
    return take(
      reverse(
        sortBy(this.validators, [
          (validator) => {
            return validator.votingPower
          },
        ])
      ),
      10
    )
  }

  async getGovernanceOverview() {

    const [pool, communityPoolArray, topVoters] = await Promise.all([
      this.query('cosmos/staking/v1beta1/pool'),
      this.query('cosmos/distribution/v1beta1/community_pool'),
      this.getTopVoters(),
    ])

    const stakingCoin = this.network.getCoinLookup(
      this.network.stakingDenom,
      'viewDenom'
    )

    const stakingChainDenom = stakingCoin.chainDenom

    const communityPool = communityPoolArray.pool.find(
      ({ denom }) => denom === stakingChainDenom
    )
    return {
      totalStakedAssets: setDecimalLength(
        reducers.getStakingCoinViewAmount(pool.pool.bonded_tokens),
        2
      ),
      totalVoters: undefined,
      treasurySize: setDecimalLength(
        reducers.getStakingCoinViewAmount(communityPool.amount),
        2
      ),
      topVoters: topVoters.map((topVoter) =>
        this.reducers.topVoterReducer(topVoter)
      ),
    }
  }

  async getDelegatorVote({ proposalId, address }) {
    const response = await this.query(
      `cosmos/gov/v1beta1/proposals/${proposalId}/votes`
    )
    const votes = response || []
    const vote = votes.find(({ voter }) => voter === address) || {}
    return {
      option: vote.option,
    }
  }

  async getBlock(blockHeight) {
    let block
    if (blockHeight) {
      block = await this.get(`blocks/${blockHeight}`)
    } else {
      block = await this.get(`blocks/latest`)
    }
    return this.reducers.blockReducer(block)
  }

  async getBalances(address) {
    const [balancesResponse, delegations, undelegations] = await Promise.all([
      this.queryAutoPaginate(`cosmos/bank/v1beta1/balances/${address}`),
      this.getDelegationsForDelegator(address),
      this.getUndelegationsForDelegator(address),
    ])
    const balances = balancesResponse || []
    const coins = await Promise.all(
      balances.map(async (balance) => {
        let ibcInfo
        if (balance.denom.startsWith('ibc/')) {
          ibcInfo = await this.getIbcInfo(balance.denom)
        }
        return this.reducers.coinReducer(balance, ibcInfo)
      })
    )
    // also check if there are any denoms as rewards the user has not as a balance
    // we need to show those as well in the balance overview as we show the rewards there
    const rewards = await this.getRewards(address)
    const rewardsBalances = rewards.reduce((coinsAggregator, reward) => {
      if (
        !coins.find((coin) => coin.denom === reward.denom) &&
        !coinsAggregator.find((coin) => coin.denom === reward.denom)
      ) {
        coinsAggregator.push({
          amount: 0,
          denom: reward.denom,
        })
      }
      return coinsAggregator
    }, [])
    // join regular balances and rewards balances
    coins.push(...rewardsBalances)

    // the user might not have liquid staking tokens but have staking tokens delegated
    // if we don't add the staking denom, we would show a 0 total for the staking denom which is wrong
    const hasStakingDenom = coins.find(
      ({ denom }) => denom === this.network.stakingDenom
    )

    if (!hasStakingDenom) {
      coins.push({
        amount: BigNumber(0),
        denom: this.network.stakingDenom,
      })
    }
    return coins.map((coin) => {
      return this.reducers.balanceReducer(coin, delegations, undelegations)
    })
  }

  async getIbcInfo(traceId) {
    if (traceId.startsWith('ibc/')) {
      traceId = traceId.split(`/`)[1]
    }
    const result = await this.get(
      `/ibc/apps/transfer/v1/denom_traces/${traceId}`
    )
    const trace = result.denom_trace
    const chainTrace = await Promise.all(
      chunk(trace.path.split('/'), 2).map(async ([port, channel]) => {
        const result = await this.get(
          `/ibc/core/channel/v1/channels/${channel}/ports/${port}/client_state`
        )
        return result.identified_client_state.client_state.chain_id
      })
    )
    return {
      denom: trace.base_denom,
      chainTrace,
    }
  }

  async getDelegationsForDelegator(address) {
    await this.dataReady

    const delegations = await this.queryAutoPaginate(
      `cosmos/staking/v1beta1/delegations/${address}`
    ).catch(console.log) || []

    return delegations.length ? delegations
      .map((delegation) =>
        this.reducers.delegationReducer(
          delegation,
          this.validators[delegation.delegation.validator_address],
          delegationEnum.ACTIVE
        )
      )
      .filter((delegation) => BigNumber(delegation.amount).gt(0)) : []
  }

  async getUndelegationsForDelegator(address) {
    await this.dataReady
    const undelegations =
      (await this.queryAutoPaginate(
        `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`
      )) || []

    // undelegations come in a nested format { validator_address, delegator_address, entries }
    // we flatten the format to be able to easier iterate over the list
    const flattenedUndelegations = undelegations.reduce(
      (list, undelegation) =>
        list.concat(
          undelegation.entries.map((entry) => ({
            validator_address: undelegation.validator_address,
            delegator_address: undelegation.delegator_address,
            balance: entry.balance,
            completion_time: entry.completion_time,
            creation_height: entry.creation_height,
            initial_balance: entry.initial_balance,
          }))
        ),
      []
    )
    return flattenedUndelegations.map((undelegation) =>
      this.reducers.undelegationReducer(
        undelegation,
        this.validators[undelegation.validator_address]
      )
    )
  }

  async getValidatorDelegations(validator) {
    const delegations = await this.query(
      `staking/validators/${validator.operatorAddress}/delegations`
    ).catch(() => {
      return []
    })
    return delegations.result.map((delegation) =>
      this.reducers.delegationReducer(
        delegation,
        validator,
        delegationEnum.ACTIVE
      )
    )
  }

  async getAnnualProvision() {
    const response = await this.query(`cosmos/mint/v1beta1/annual_provisions`)
    return response.annual_provisions || undefined
  }

  async getPool() {
    return await this.query(`cosmos/staking/v1beta1/pool`)
  }

  async getRewards(delegatorAddress) {
    await this.dataReady
    const result = await this.query(
      `cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`
    )
    const rewards = (result.rewards || []).filter(
      ({ reward }) => reward && reward.length > 0
    )

    return await this.reducers.rewardReducer(rewards, this.validators)
  }

  async loadPaginatedTxs(url, page = 1) {
    if (page < 1) {
      return []
    }

    let offset = (page - 1) * PAGE_RECORDS_COUNT
    const pagination = `&pagination.limit=${PAGE_RECORDS_COUNT}&pagination.offset=${offset}`
    const { tx_responses } = await this.get(`${url}${pagination}`)
    return tx_responses || []
  }

  async getPageCount(url) {
    const response = await this.get(url + `&pagination.limit=${PAGE_RECORDS_COUNT}`)
    return Math.ceil(response.pagination.total / PAGE_RECORDS_COUNT)
  }
}

function percentage(x, total) {
  // percentage output should always be a number between 0 and 1
  return total.toNumber() > 0
    ? BigNumber(x).div(total).toNumber().toFixed(4)
    : 0
}

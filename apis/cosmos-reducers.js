/* eslint-disable */

import BigNumber from 'bignumber.js'
import { reverse, sortBy, uniq, uniqWith } from 'lodash'
import { encodeB32, decodeB32 } from '~/common/address'
import { getProposalSummary } from '~/common/common-reducers'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export function getStakingCoinViewAmount(chainStakeAmount) {
  const coinLookup = network.getCoinLookup(network.stakingDenom, 'viewDenom')
  return coinReducer({
    amount: chainStakeAmount,
    denom: coinLookup.chainDenom,
  }).amount
}

export function coinReducer(chainCoin, ibcInfo) {
  const chainDenom = ibcInfo ? ibcInfo.denom : chainCoin.denom
  const coinLookup = network.getCoinLookup(chainDenom)
  const sourceChain = ibcInfo ? ibcInfo.chainTrace[0] : undefined

  if (!coinLookup) {
    return {
      supported: false,
      amount: chainCoin.amount,
      denom: chainDenom,
      sourceChain,
    }
  }

  const precision = coinLookup.chainToViewConversionFactor
    .toString()
    .split('.')[1].length

  return {
    supported: true,
    amount: BigNumber(chainCoin.amount)
      .times(coinLookup.chainToViewConversionFactor)
      .toFixed(precision),
    denom: coinLookup.viewDenom,
    sourceChain,
  }
}

// reduce deposits to one number
// ATTENTION doesn't consider multi denom deposits
function getDeposit(proposal) {

  const sum = proposal.total_deposit
    .filter(({ denom }) => denom === network.stakingDenom)
  let s = sum.reduce((ss, cur) => { return ss.plus(cur.amount) }, BigNumber(0))
  return getStakingCoinViewAmount(s)
}

function getTotalVotePercentage(proposal, totalBondedTokens, totalVoted) {
  // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
  console.log(proposal, totalBondedTokens)
  if (proposalFinalized(proposal)) return -1
  if (BigNumber(totalVoted).eq(0)) return 0
  if (!totalBondedTokens) return -1
  return Number(
    BigNumber(totalVoted)
      .div(getStakingCoinViewAmount(totalBondedTokens))
      .toFixed(4) // output is 0.1234 = 12.34%
  )
}

export function tallyReducer(proposal, tally, totalBondedTokens) {
  // if the proposal is out of voting, use the final result for the tally
  if (proposalFinalized(proposal)) {
    tally.tally = proposal.final_tally_result
  }

  const totalVoted = getStakingCoinViewAmount(
    BigNumber(tally.tally.yes)
      .plus(tally.tally.no)
      .plus(tally.tally.abstain)
      .plus(tally.tally.no_with_veto)
  )

  // console.log(tally)
  return {
    yes: getStakingCoinViewAmount(tally.tally.yes),
    no: getStakingCoinViewAmount(tally.tally.no),
    abstain: getStakingCoinViewAmount(tally.tally.abstain),
    veto: getStakingCoinViewAmount(tally.tally.no_with_veto),
    total: totalVoted,
    totalVotedPercentage: getTotalVotePercentage(
      proposal,
      totalBondedTokens,
      totalVoted
    ),
  }
}

export function depositReducer(deposit, validators) {
  return {
    id: deposit.depositor,
    amount: deposit.amount.map(coinReducer),
    depositer: networkAccountReducer(deposit.depositor, validators),
  }
}

export function voteReducer(vote, validators) {
  return {
    id: String(vote.proposal_id.concat(`_${vote.voter}`)),
    voter: networkAccountReducer(vote.voter, validators),
    option: vote.option,
  }
}

function networkAccountReducer(address, validators) {
  const proposerValAddress = address
    ? encodeB32(decodeB32(address), network.validatorAddressPrefix, `hex`)
    : ''
  const validator =
    validators && proposerValAddress.length > 0
      ? validators[proposerValAddress]
      : undefined
  return {
    name: validator ? validator.name : undefined,
    address: validator ? proposerValAddress : address || '',
    picture: validator ? validator.picture : '',
    validator,
  }
}

export function topVoterReducer(topVoter) {
  return {
    name: topVoter.name,
    address: topVoter.operatorAddress,
    votingPower: topVoter.votingPower,
    picture: topVoter.picture,
    validator: topVoter,
  }
}

function getValidatorStatus(validator) {
  if (validator.status === 3) {
    return {
      status: 'ACTIVE',
      status_detailed: 'active',
    }
  }
  if (
    validator.signing_info &&
    new Date(validator.signing_info.jailed_until) > new Date(9000, 1, 1)
  ) {
    return {
      status: 'INACTIVE',
      status_detailed: 'banned',
    }
  }

  return {
    status: 'INACTIVE',
    status_detailed: 'inactive',
  }
}

export function blockReducer(block) {
  return {
    id: block.block_id.hash,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    hash: block.block_id.hash,
    time: block.block.header.time,
    proposer_address: block.block.header.proposer_address,
  }
}

// delegations rewards in Tendermint are located in events as strings with this form:
// amount: {"15000umuon"}, or in multidenom networks they look like this:
// amount: {"15000ungm,100000uchf,110000ueur,2000000ujpy"}
// That is why we need this separate function to extract those amounts in this format
export function rewardCoinReducer(reward) {
  const multiDenomRewardsArray = reward.split(`,`)
  const mappedMultiDenomRewardsArray = multiDenomRewardsArray.map((reward) => {
    const rewardDenom = reward.match(/[a-z]+/gi)[0]
    const rewardAmount = reward.match(/[0-9]+/gi)
    return coinReducer({
      amount: rewardAmount,
      denom: rewardDenom,
    })
  })
  return mappedMultiDenomRewardsArray
}

export function balanceReducer(lunieCoin, delegations, undelegations) {
  const isStakingDenom = lunieCoin.denom === network.stakingDenom
  const delegatedStake = delegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const undelegatingStake = undelegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const total = isStakingDenom
    ? BigNumber(lunieCoin.amount).plus(delegatedStake).plus(undelegatingStake)
    : lunieCoin.amount
  return {
    id: lunieCoin.denom,
    type: isStakingDenom ? 'STAKE' : 'CURRENCY',
    total,
    denom: lunieCoin.denom,
    available: lunieCoin.amount,
    staked: delegatedStake.amount || 0,
    sourceChain: lunieCoin.sourceChain,
  }
}

export function undelegationReducer(undelegation, validator) {
  return {
    id: `${validator.operatorAddress}_${undelegation.creation_height}`,
    delegatorAddress: undelegation.delegator_address,
    validator,
    amount: getStakingCoinViewAmount(undelegation.balance),
    startHeight: undelegation.creation_height,
    endTime: undelegation.completion_time,
  }
}

export function reduceFormattedRewards(reward, validator) {
  return reward.map((denomReward) => {
    const lunieCoin = coinReducer(denomReward)
    if (Number(lunieCoin.amount) < 0.000001) return null

    return {
      id: `${validator.operatorAddress}_${lunieCoin.denom}`,
      denom: lunieCoin.denom,
      amount: lunieCoin.amount,
      validator,
    }
  })
}

export async function rewardReducer(rewards, validatorsDictionary) {
  const formattedRewards = rewards.map((reward) => ({
    reward: reward.reward,
    validator: validatorsDictionary[reward.validator_address],
  }))
  const multiDenomRewardsArray = await Promise.all(
    formattedRewards.map(({ reward, validator }) =>
      reduceFormattedRewards(reward, validator)
    )
  )
  return multiDenomRewardsArray.flat().filter((reward) => reward)
}

const proposalTypeEnumDictionary = {
  TextProposal: 'TEXT',
  CommunityPoolSpendProposal: 'TREASURY',
  ParameterChangeProposal: 'PARAMETER_CHANGE',
  'ibc.core.client.v1.UpgradeProposal': 'UPGRADE_PROPOSAL',
  'ibc.core.client.v1.ClientUpdateProposal': 'CLIENT_UPDATE',
  'cosmos.params.v1beta1.ParameterChangeProposal': 'PARAMETER_CHANGE',
}

// map Cosmos SDK message types to Lunie message types
export function getMessageType(type) {
  const transactionTypeSuffix = type.split('/')[1]
  switch (transactionTypeSuffix) {
    case 'cosmos.bank.v1beta1.MsgSend':
      return lunieMessageTypes.SEND
    case 'cosmos.staking.v1beta1.MsgDelegate':
      return lunieMessageTypes.STAKE
    case 'cosmos.staking.v1beta1.MsgBeginRedelegate':
      return lunieMessageTypes.RESTAKE
    case 'cosmos.staking.v1beta1.MsgUndelegate':
      return lunieMessageTypes.UNSTAKE
    case 'cosmos.staking.v1beta1.MsgEditValidator':
      return lunieMessageTypes.EDIT_VALIDATOR
    case 'cosmos.staking.v1beta1.MsgCreateValidator':
      return lunieMessageTypes.CREATE_VALIDATOR
    case 'cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward':
      return lunieMessageTypes.CLAIM_REWARDS
    case 'cosmos.distribution.v1beta1.MsgFundCommunityPool':
      return lunieMessageTypes.FUND_COMMUNITY_POOL
    case 'cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission':
      return lunieMessageTypes.CLAIM_REWARDS
    case 'cosmos.gov.v1beta1.MsgSubmitProposal':
      return lunieMessageTypes.SUBMIT_PROPOSAL
    case 'cosmos.gov.v1beta1.MsgVote':
      return lunieMessageTypes.VOTE
    case 'cosmos.gov.v1beta1.MsgDeposit':
      return lunieMessageTypes.DEPOSIT
    case 'cosmos.slashing.v1beta1.MsgUnjail':
      return lunieMessageTypes.SUBMIT_PROPOSAL
    case 'ibc.applications.transfer.v1.MsgTransfer':
      return lunieMessageTypes.IBC
    default:
      return lunieMessageTypes.UNKNOWN
  }
}

export function setTransactionSuccess(transaction, index) {
  // TODO identify logs per message
  if (transaction.code) {
    return false
  }
  return true
}

export function sendDetailsReducer(message) {
  return {
    from: [message.from_address],
    to: [message.to_address],
    amounts: message.amount.map(coinReducer),
  }
}

export function stakeDetailsReducer(message) {
  return {
    to: [message.validator_address],
    amount: coinReducer(message.amount),
  }
}

export function restakeDetailsReducer(message) {
  return {
    from: [message.validator_src_address],
    to: [message.validator_dst_address],
    amount: coinReducer(message.amount),
  }
}

export function unstakeDetailsReducer(message) {
  return {
    from: [message.validator_address],
    amount: coinReducer(message.amount),
  }
}

export function claimRewardsDetailsReducer(message, transaction) {
  return {
    from: message.value.validators,
    amounts: claimRewardsAmountReducer(transaction),
  }
}

export function claimRewardsAmountReducer(transaction) {
  const transactionClaimEvents = []

  transaction.logs.forEach((log) => {
    log.events.forEach((event) => {
      if (event.type === `transfer`) {
        transactionClaimEvents.push(event)
      }
    })
  })

  if (transactionClaimEvents.length === 0) {
    return [{ denom: '', amount: 0 }]
  }

  const amountAttributes = []
  transactionClaimEvents.forEach((event) => {
    event.attributes.forEach((attribute) => {
      if (attribute.key === `amount`) {
        amountAttributes.push(attribute)
      }
    })
  })

  const allClaimedRewards = amountAttributes
    .map((amount) => amount.value)
    .map((rewardValue) => rewardCoinReducer(rewardValue))
  const aggregatedClaimRewardsObject = allClaimedRewards.reduce(
    (all, rewards) => {
      rewards.forEach((reward) => {
        all = {
          ...all,
          [reward.denom]: BigNumber(reward.amount).plus(all[reward.denom] || 0),
        }
      })
      return all
    },
    {}
  )
  const claimedRewardsDenomArray = Object.entries(aggregatedClaimRewardsObject)
  return claimedRewardsDenomArray.map(([denom, amount]) => ({ denom, amount }))
}

export function submitProposalDetailsReducer(message) {
  return {
    proposalType: message.content.type,
    proposalTitle: message.content.title,
    proposalDescription: message.content.description,
    initialDeposit: coinReducer(message.initial_deposit[0]),
  }
}

export function voteProposalDetailsReducer(message) {
  return {
    proposalId: message.proposal_id,
    voteOption: message.option,
  }
}

export function depositDetailsReducer(message) {
  return {
    proposalId: message.proposal_id,
    amount: coinReducer(message.amount[0]),
  }
}

// function to map cosmos messages to our details format
export function transactionDetailsReducer(type, message, transaction) {
  let details
  switch (type) {
    case lunieMessageTypes.SEND:
      details = sendDetailsReducer(message)
      break
    case lunieMessageTypes.STAKE:
      details = stakeDetailsReducer(message)
      break
    case lunieMessageTypes.RESTAKE:
      details = restakeDetailsReducer(message)
      break
    case lunieMessageTypes.UNSTAKE:
      details = unstakeDetailsReducer(message)
      break
    case lunieMessageTypes.CLAIM_REWARDS:
      details = claimRewardsDetailsReducer(message, transaction)
      break
    case lunieMessageTypes.SUBMIT_PROPOSAL:
      details = submitProposalDetailsReducer(message)
      break
    case lunieMessageTypes.VOTE:
      details = voteProposalDetailsReducer(message)
      break
    case lunieMessageTypes.DEPOSIT:
      details = depositDetailsReducer(message)
      break
    default:
      details = {}
  }

  return {
    type,
    ...details,
  }
}

export function claimRewardsMessagesAggregator(claimMessages) {
  // reduce all withdraw messages to one one collecting the validators from all the messages
  const onlyValidatorsAddressesArray = claimMessages.map(
    (msg) => msg.validator_address
  )
  return {
    '@type': `/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward`, // prefix omited as not important
    value: {
      validators: onlyValidatorsAddressesArray,
    },
  }
}

function proposalBeginTime(proposal) {
  switch (proposal.status) {
    case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
      return proposal.submit_time
    case 'PROPOSAL_STATUS_VOTING_PERIOD':
      return proposal.voting_start_time
    case 'PROPOSAL_STATUS_PASSED':
    case 'PROPOSAL_STATUS_REJECTED':
      return proposal.voting_end_time
  }
}

function proposalEndTime(proposal) {
  switch (proposal.status) {
    case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
      return proposal.deposit_end_time
    case 'PROPOSAL_STATUS_VOTING_PERIOD':
    // the end time lives in the past already if the proposal is finalized
    // eslint-disable-next-line no-fallthrough
    case 'PROPOSAL_STATUS_PASSED':
    case 'PROPOSAL_STATUS_REJECTED':
      return proposal.voting_end_time
  }
}

function proposalFinalized(proposal) {
  return ['PROPOSAL_STATUS_PASSED', 'PROPOSAL_STATUS_REJECTED'].includes(
    proposal.status
  )
}

export function proposalReducer(
  proposal,
  totalBondedTokens,
  detailedVotes
) {
  // console.log(tallyReducer(proposal, detailedVotes.tally, totalBondedTokens))
  return {
    id: Number(proposal.proposal_id),
    proposalId: String(proposal.proposal_id),
    type: proposalTypeEnumDictionary[proposal.content["@type"].split('/')[1]],
    title: proposal.content.title,
    description: proposal.content.description,
    creationTime: proposal.submit_time,
    status: proposal.status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, detailedVotes.tally, totalBondedTokens),
    deposit: getDeposit(proposal),
    summary: getProposalSummary(
      proposalTypeEnumDictionary[proposal.content["@type"].split('/')[1]]
    ),
    detailedVotes,
  }
}

export function getTransactionLogs(transaction, index) {
  if (!transaction.logs || !transaction.logs[index]) {
    return JSON.parse(JSON.stringify(transaction.raw_log)).message
  }
  const log = transaction.logs[index]
  return log.success === false ? transaction.logs[0].log : log.log // failing txs show the first logs
}

export function transactionReducer(transaction) {
  try {
    // TODO check if this is anywhere not an array
    let fees
    if (
      transaction.tx.value &&
      Array.isArray(transaction.tx.value.fee.amount)
    ) {
      fees = transaction.tx.value.fee.amount.map((coin) => {
        const coinLookup = network.getCoinLookup(network, coin.denom)
        return coinReducer(coin, coinLookup)
      })
    } else {
      fees = transaction.tx.auth_info.fee.amount.map((fee) => {
        const coinLookup = network.getCoinLookup(network, fee.denom)
        return coinReducer(fee, coinLookup)
      })
    }
    const {
      claimMessages,
      otherMessages,
    } = transaction.tx.body.messages.reduce(
      ({ claimMessages, otherMessages }, message) => {
        // we need to aggregate all withdraws as we display them together in one transaction
        if (getMessageType(message['@type']) === lunieMessageTypes.CLAIM_REWARDS) {
          claimMessages.push(message)
        } else {
          otherMessages.push(message)
        }
        return { claimMessages, otherMessages }
      },
      { claimMessages: [], otherMessages: [] }
    )

    // we need to aggregate claim rewards messages in one single one to avoid transaction repetition
    const claimMessage =
      claimMessages.length > 0
        ? claimRewardsMessagesAggregator(claimMessages)
        : undefined
    const allMessages = claimMessage
      ? otherMessages.concat(claimMessage) // add aggregated claim message
      : otherMessages
    const returnedMessages = allMessages.map(
      (message, messageIndex) => ({
        id: transaction.txhash,
        type: getMessageType(message['@type']),
        hash: transaction.txhash,
        networkId: network.id,
        key: `${transaction.txhash}_${messageIndex}`,
        height: transaction.height,
        details: transactionDetailsReducer(
          getMessageType(message['@type']),
          message,
          transaction
        ),
        timestamp: transaction.timestamp,
        memo: transaction.tx.body.memo,
        fees,
        success: setTransactionSuccess(transaction, messageIndex),
        log: getTransactionLogs(transaction, messageIndex),
        involvedAddresses: extractInvolvedAddresses(
          transaction.logs.find(
            ({ msg_index: msgIndex }) => msgIndex === messageIndex
          ).events
        ),
        rawMessage: {
          // type,
          message,
        },
      })
    )
    return returnedMessages
  } catch (error) {
    console.error(error)
    return [] // must return something differ from undefined
  }
}
export function transactionsReducer(txs) {
  const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  const reversedTxs = reverse(sortedTxs)
  // here we filter out all transactions related to validators
  return reversedTxs.reduce((collection, transaction) => {
    return collection.concat(transactionReducer(transaction))
  }, [])
}

export function delegationReducer(delegation, validator, active) {
  const coinLookup = network.getCoinLookup(network.stakingDenom, delegation.balance.denom)
  const { amount, denom } = coinReducer(delegation.balance, coinLookup)

  return {
    id: delegation.delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.delegation.validator_address,
    delegatorAddress: delegation.delegation.delegator_address,
    validator,
    amount,
    active,
  }
}

export function getValidatorUptimePercentage(validator, signedBlocksWindow) {// temp
  if (
    validator.signing_info &&
    validator.signing_info.missed_blocks_counter &&
    signedBlocksWindow
  ) {
    return (
      1 -
      Number(validator.signing_info.missed_blocks_counter) /
      Number(signedBlocksWindow)
    )
  } else {
    return 1
  }
}

export function validatorReducer(validator, tokensTotal) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  // const pctCommission = new BigNumber(1 - validator.commission.commission_rates.rate)
  // const provision = new BigNumber(annualProvision)
  // const bonded = new BigNumber(pool.pool.bonded_tokens)
  // const expectedRewards = pctCommission.times(provision.div(bonded))

  return {
    id: validator.operator_address,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    details: validator.description.details,
    website: websiteURL,
    identity: validator.description.identity,
    name: validator.description.moniker,
    votingPower: (validator.tokens / tokensTotal).toFixed(6),
    startHeight: validator.signing_info
      ? validator.signing_info.start_height
      : undefined,
    uptimePercentage: 1,
    // getValidatorUptimePercentage(
    //   validator,
    //   signedBlocksWindow
    // ),
    tokens: getStakingCoinViewAmount(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: Number(validator.commission.commission_rates.rate).toFixed(6),
    maxCommission: validator.commission.commission_rates.max_rate,
    maxChangeCommission: validator.commission.commission_rates.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    // expectedReturns: annualProvision
      // ? expectedRewards
      // : undefined,
  }
}

export function extractInvolvedAddresses(messageEvents) {
  // If the transaction has failed, it doesn't get tagged
  if (!Array.isArray(messageEvents)) return []

  // extract all addresses from events that are either sender or recipient
  const involvedAddresses = messageEvents.reduce((involvedAddresses, event) => {
    const senderAttributes = event.attributes
      .filter(({ key }) => key === 'sender')
      .map((sender) => sender.value)
    if (senderAttributes.length) {
      involvedAddresses = [...involvedAddresses, ...senderAttributes]
    }

    const recipientAttribute = event.attributes.find(
      ({ key }) => key === 'recipient'
    )
    if (recipientAttribute) {
      involvedAddresses.push(recipientAttribute.value)
    }

    return involvedAddresses
  }, [])
  return uniq(involvedAddresses)
}

export function undelegationEndTimeReducer(transaction) {
  const events = transaction.logs.reduce(
    (events, log) => (log.events ? events.concat(log.events) : events),
    []
  )

  let completionTimeAttribute
  events.find(({ attributes }) => {
    if (attributes) {
      completionTimeAttribute = attributes.find(
        (tx) => tx.key === `completion_time`
      )
    }
    return !!completionTimeAttribute
  })
  return completionTimeAttribute ? completionTimeAttribute.value : undefined
}

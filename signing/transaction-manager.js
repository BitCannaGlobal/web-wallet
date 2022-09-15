// Update version for using version 0.44.0 of the cosmos sdk / keplr
// By @atmoner for Bitcanna 2021
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import {
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
  defaultRegistryTypes,
} from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { getSigner } from './signer'
// import messageCreators from './messages.js'
import fees from '~/common/fees'
import network from '~/common/network'
// import { signWithExtension } from '~/common/extension-utils'

export function getFees(transactionType, feeDenom) {
  const { gasEstimate, feeOptions } = fees.getFees(transactionType)
  const fee = feeOptions.find(({ denom }) => denom === feeDenom)
  const coinLookup = network.getCoinLookup(fee.denom, 'viewDenom')
  // converting view fee to on chain fee
  const convertedFee = [
    {
      amount: BigNumber(fee.amount)
        .div(coinLookup.chainToViewConversionFactor)
        .toString(),
      denom: coinLookup.chainDenom,
    },
  ]
  return {
    gas: String(gasEstimate),
    amount: convertedFee,
  }
  /* First example
  const fee = {
    amount: [
      {
        denom: 'ubcna',
        amount: '5000',
      },
    ],
    gas: '200000',
  }
  */
}

export async function createSignBroadcast({
  messageType,
  message,
  senderAddress,
  accountInfo,
  network,
  signingType,
  password,
  HDPath,
  feeDenom,
  chainId,
  memo,
  ledgerTransport,
}) {
  const feeData = getFees(messageType, feeDenom)

  if (signingType !== 'extension') {
    const signer = await getSigner(
      signingType,
      {
        address: senderAddress,
        password,
      },
      chainId,
      ledgerTransport
    )
    // console.log(message)
    switch (messageType) {
      case 'SendTx':
        try {
          const finalAmout = (message.amounts[0].amount * 1000000).toString()
          const getTx = await sendTxBcna(
            signer,
            senderAddress,
            message.to[0],
            finalAmout,
            feeData,
            memo,
            signingType
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      case 'StakeTx':
        try {
          const finalAmout = (message.amount.amount * 1000000).toString()
          const getTx = await delegateTokensBcna(
            signer,
            senderAddress,
            message.to[0],
            finalAmout,
            feeData,
            signingType
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      case 'UnstakeTx':
        try {
          const finalAmout = (message.amount.amount * 1000000).toString()
          const getTx = await unDelegateTokensBcna(
            signer,
            message.from[0],
            senderAddress,
            finalAmout,
            feeData,
            signingType
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      case 'RestakeTx':
        try {
          const finalAmout = (message.amount.amount * 1000000).toString()
          const getTx = await ReDelegateTokensBcna(
            signer,
            message.delegator[0],
            message.from[0],
            message.to[0],
            finalAmout,
            feeData,
            signingType
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      case 'ClaimRewardsTx':
        try {
          const getTx = await rewardBcna(
            signer,
            senderAddress,
            message.from,
            feeData,
            signingType
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      case 'VoteTx':
        try {
          const getTx = await voteTxBcna(
            signer,
            senderAddress,
            message.proposalId,
            message.voteOption,
            feeData,
            signingType
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      default:
        console.log(`Sorry, we are out of ${messageType}.`)
    }
  }
}

async function sendTxBcna(
  sign,
  addFrom,
  addTo,
  amountBcna,
  fee,
  memo,
  signingType
) {
  let wallet = ''
  if (signingType === 'local') {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(sign.secret.data, {
      prefix: network.addressPrefix,
    })
  } else {
    wallet = sign
  }

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )
  const amount = {
    denom: 'ubcna',
    amount: amountBcna,
  }

  const result = await client.sendTokens(addFrom, addTo, [amount], fee, memo)
  assertIsBroadcastTxSuccess(result)

  return result
}
async function rewardBcna(sign, addFrom, addTo, fee, signingType) {
  let wallet = ''
  if (signingType === 'local') {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(sign.secret.data, {
      prefix: network.addressPrefix,
    })
  } else {
    wallet = sign
  }

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )

  const WithdrawDelegatorReward = defaultRegistryTypes[3][1] // MsgWithdrawDelegatorReward
  // console.log(WithdrawDelegatorReward)
  const copieDelegator = []
  addTo.forEach(function (item) {
    copieDelegator.push({
      typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
      value: WithdrawDelegatorReward.fromPartial({
        delegatorAddress: addFrom,
        validatorAddress: item,
      }),
    })
  })
  const result = client.signAndBroadcast(addFrom, copieDelegator, fee, '')
  assertIsBroadcastTxSuccess(result)
  return result
}

async function delegateTokensBcna(
  sign,
  addFrom,
  addTo,
  amountBcna,
  fee,
  signingType
) {
  let wallet = ''
  if (signingType === 'local') {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(sign.secret.data, {
      prefix: network.addressPrefix,
    })
  } else {
    wallet = sign
  }

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )

  const amount = {
    denom: 'ubcna',
    amount: amountBcna,
  }

  const result = await client.delegateTokens(
    addFrom,
    addTo,
    amount,
    fee,
    ''
  )
  assertIsBroadcastTxSuccess(result)
  return result
}
async function unDelegateTokensBcna(
  sign,
  validator,
  fromDel,
  amountBcna,
  fee,
  signingType
) {
  let wallet = ''
  if (signingType === 'local') {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(sign.secret.data, {
      prefix: network.addressPrefix,
    })
  } else {
    wallet = sign
  }

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )

  const amount = {
    denom: 'ubcna',
    amount: amountBcna,
  }

  const result = await client.undelegateTokens(
    fromDel,
    validator,
    amount,
    fee,
    ''
  )
  assertIsBroadcastTxSuccess(result)
  return result
}
async function ReDelegateTokensBcna(
  sign,
  delegator,
  valFrom,
  valTo,
  amountBcna,
  fee,
  signingType
) {
  let wallet = ''
  if (signingType === 'local') {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(sign.secret.data, {
      prefix: network.addressPrefix,
    })
  } else {
    wallet = sign
  }

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )

  const amountFinal = {
    denom: 'ubcna',
    amount: amountBcna,
  }
  const MsgBeginRedelegate = defaultRegistryTypes[8][1] // MsgBeginRedelegate
  const reDelegateMsg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    value: MsgBeginRedelegate.fromPartial({
      delegatorAddress: delegator,
      validatorSrcAddress: valFrom,
      validatorDstAddress: valTo,
      amount: amountFinal,
    }),
  }
  const result = client.signAndBroadcast(delegator, [reDelegateMsg], fee, '')
  assertIsBroadcastTxSuccess(result)
  return result
}

async function voteTxBcna(sign, fromDel, proposalIdd, vote, fee, signingType) {
  let wallet = ''
  if (signingType === 'local') {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(sign.secret.data, {
      prefix: network.addressPrefix,
    })
  } else {
    wallet = sign
  }

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )
  // More info: https://docs.cosmos.network/master/core/proto-docs.html#cosmos.gov.v1beta1.VoteOption
  let finalVote
  switch (vote) {
    case 'Yes':
      finalVote = '1'
      break
    case 'Abstain':
      finalVote = '2'
      break
    case 'No':
      finalVote = '3'
      break
    case 'NoWithVeto':
      finalVote = '4'
      break
    default:
      finalVote = '0'
  }

  /* const result = await client.voteProposale(
    fromDel,
    proposalId,
    finalVote,
    fee,
    'Voted from Bitcanna WebWallet'
  ) */
  const MsgVote = defaultRegistryTypes[7][1] // MsgVote
  const voteMsg = {
    typeUrl: '/cosmos.gov.v1beta1.MsgVote',
    value: MsgVote.fromPartial({
      proposalId: proposalIdd,
      voter: fromDel,
      option: finalVote,
    }),
  }
  const result = client.signAndBroadcast(fromDel, [voteMsg], fee, '')
  assertIsBroadcastTxSuccess(result)
  return result
}

export async function pollTxInclusion(txHash, iteration = 0) {
  const MAX_POLL_ITERATIONS = 30
  let txFound = false
  try {
    await fetch(`${network.apiURL}/cosmos/tx/v1beta1/txs/${txHash}`).then(
      (res) => {
        if (res.status === 200) {
          txFound = true
        }
      }
    )
  } catch (err) {
    // ignore error
  }
  if (txFound) {
    return true
  } else if (iteration < MAX_POLL_ITERATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return pollTxInclusion(txHash, iteration + 1)
  } else {
    throw new Error(
      `The transaction wasn't included in time. Check explorers for the transaction hash ${txHash}.`
    )
  }
}

// Update version for using version 0.44.0 of the cosmos sdk
// By @atmoner for Bitcanna 2021
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import {
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
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
  // await console.log(ledgerTransport)
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
    switch (messageType) {
      case 'SendTx':
        try {
          const finalAmout = (message.amounts[0].amount * 1000000).toString()
          const getTx = await sendTxBcna(
            signer.secret.data,
            senderAddress,
            message.to[0],
            finalAmout,
            feeData,
            memo
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
            signer.secret.data,
            senderAddress,
            message.to[0],
            finalAmout,
            feeData
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
            signer.secret.data,
            message.from[0],
            senderAddress,
            finalAmout,
            feeData
          )
          return {
            hash: getTx.transactionHash,
          }
        } catch (err) {
          throw new Error(err)
        }
      case 'ClaimRewardsTx':
        try {
          // TODO foreach validator to reward
          const getTx = await rewardBcna(
            signer.secret.data,
            senderAddress,
            message.from[0],
            feeData
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
            signer.secret.data,
            senderAddress,
            message.proposalId,
            message.voteOption,
            feeData
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
  } else {
    // Here is new code for Ledger/Keplr
  }
}

async function sendTxBcna(mnemonic, addFrom, addTo, amountBcna, fee, memo) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'bcna',
  })

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
async function rewardBcna(mnemonic, addFrom, addTo, fee) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'bcna',
  })

  const client = await SigningStargateClient.connectWithSigner(
    network.rpcURL,
    wallet
  )

  const result = await client.withdrawRewards(
    addFrom,
    addTo,
    fee,
    'Reward from lunie!'
  )
  assertIsBroadcastTxSuccess(result)
  return result
}

async function delegateTokensBcna(mnemonic, addFrom, addTo, amountBcna, fee) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'bcna',
  })

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
    'Delegated from Bitcanna WebWallet'
  )
  assertIsBroadcastTxSuccess(result)
  return result
}
async function unDelegateTokensBcna(
  mnemonic,
  validator,
  fromDel,
  amountBcna,
  fee
) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'bcna',
  })

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
    'Undelegate from Bitcanna WebWallet'
  )
  assertIsBroadcastTxSuccess(result)
  return result
}

async function voteTxBcna(mnemonic, fromDel, proposalId, vote, fee) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'bcna',
  })

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

  const result = await client.voteProposale(
    fromDel,
    proposalId,
    finalVote,
    fee,
    'Voted from Bitcanna WebWallet'
  )
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

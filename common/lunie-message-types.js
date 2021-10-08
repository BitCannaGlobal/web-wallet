const lunieMessageTypes = {
  SEND: `SendTx`,
  STAKE: `StakeTx`,
  RESTAKE: `RestakeTx`,
  UNSTAKE: `UnstakeTx`,
  EDIT_VALIDATOR: `EditValidatorTx`,
  CREATE_VALIDATOR: `CreateValidatorTx`,
  IBC: `IBCTx`,
  VOTE: `VoteTx`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `ClaimRewardsTx`,
  FUND_COMMUNITY_POOL: `FundCommunityPoolTx`,
  SUBMIT_PROPOSAL: `SubmitProposalTx`,
  UNJAIL: `Unjail`,
  UNKNOWN: `UnknownTx`,
}

module.exports = { lunieMessageTypes }

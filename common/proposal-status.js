export const governanceStatusEnum = {
  DEPOSITING: 'DEPOSIT',
  VOTING: 'VOTING',
  PASSED: 'PASSED',
  REJECTED: 'REJECTED',
  UNKNOWN: 'FAILED',
}

export const getProposalStatus = (proposal) => {
  switch (proposal.status) {
    case `PROPOSAL_STATUS_PASSED`:
      return {
        title: `Passed`,
        value: governanceStatusEnum.PASSED,
        color: `green`,
        active: true,
      }
    case `PROPOSAL_STATUS_REJECTED`:
      return {
        title: `Rejected`,
        value: governanceStatusEnum.REJECTED,
        color: `red`,
        active: false,
      }
    case `PROPOSAL_STATUS_DEPOSIT_PERIOD`:
      return {
        title: `Deposit Period`,
        value: governanceStatusEnum.DEPOSITING,
        color: `orange`,
      }
    case `PROPOSAL_STATUS_VOTING_PERIOD`:
      return {
        title: `Voting Period`,
        value: governanceStatusEnum.VOTING,
        color: `highlight`,
      }
    default:
      return {
        title: `Error`,
        value: governanceStatusEnum.UNKNOWN,
        color: `grey`,
      }
  }
}

export const getVoteStatus = (vote) => {
  switch (vote) {
    case `VOTE_OPTION_YES`:
      return {
        title: `Yes`,
      }
    case `VOTE_OPTION_ABSTAIN`:
      return {
        title: `Abstain`,
      }
    case `VOTE_OPTION_NO`:
      return {
        title: `No`,
      }
    case `VOTE_OPTION_NO_WITH_VETO`:
      return {
        title: `Veto`,
      }
    default:
      return {
        title: `Error`,
      }
  }
}

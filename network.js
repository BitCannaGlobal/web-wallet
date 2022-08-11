export default {
  id: 'bitcanna-1',
  name: 'BitCanna',
  description:
    'BitCanna provides a decentralized payment network for the legal cannabis industry, by means of the BitCanna Coin (BCNA).',
  logo: `logo.svg`,
  website: 'https://www.bitcanna.io',
  apiURL: 'http://seed2.bitcanna.io:1317', // https://lcd.bitcanna.io
  rpcURL: 'https://rpc.bitcanna.io', // https://rpc.bitcanna.io
  explorerURL: 'https://cosmos-explorer.bitcanna.io',
  bitcannaExplorerURL: 'https://explorer.bitcanna.io',
  exchangeApiUrl: 'https://swap.bitcanna.io',
  osmosAppUrl: 'https://app.osmosis.zone',
  // minBlockHeight: 5200792, // actually 5200791, but it has the wrong block time.
  stakingDenom: 'BCNA',
  coinLookup: [
    {
      viewDenom: 'BCNA',
      chainDenom: 'ubcna',
      chainToViewConversionFactor: 1e-6,
      icon: `currencies/bcna.jpg`,
    },
  ],
  addressPrefix: 'bcna',
  validatorAddressPrefix: 'bcnavaloper',
  validatorConsensusaddressPrefix: 'bcnavalcons', // needed to map validators from staking queries to the validator set
  HDPath: `m/44'/118'/0'/0/0`,
  lockUpPeriod: `21 days`,
  fees: {
    default: {
      gasEstimate: 800000,
      feeOptions: [
        {
          denom: 'BCNA',
          amount: 0.01,
        },
      ],
    },
  },
  icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
  swapEnabled: false,
  localSigning: false, // this is only to be used as a developer tool - never deployed in production or for mainnet chains
  nftContract:
    'stars1cpzvvmlrc9lcw3q5yrznax0uk5h6xww2d4ch9xve4xu8mfvgw2kqepnwd2',
  sg721: 'stars1w4dff5myjyzymk8tkpjrzj6gnv352hcdpt2dszweqnff927a9xmqc7e0gv',
}

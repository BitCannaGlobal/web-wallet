export default {
  id: 'bitcanna-1',
  name: 'BitCanna Testnet',
  description:
    'BitCanna is a decentralized network, powered by BFT consensus algorithms like Tendermint consensus.',
  logo: `logo.svg`,
  website: 'https://www.bitcanna.io',
  // apiURL: 'http://localhost:8010/proxy',
  apiURL: 'https://cosmos-testnet.bitcanna.io',
  rpcURL: 'httsp://rpc-testnet.bitcanna.io',
  explorerURL: 'https://testnet-explorer.bitcanna.io',
  bitcannaExplorerURL: 'https://explorer.bitcanna.io',
  exchangeApiUrl: 'https://bcna-payment.dmosrv.com',
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
  swapEnabled: true,
  localSigning: true, // this is only to be used as a developer tool - never deployed in production or for mainnet chains
}

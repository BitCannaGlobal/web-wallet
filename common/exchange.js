import axios from 'axios'
import network from './network'

const KEY_TAG = `lunie-exchange-wallets`

export async function getExchangeWallet(outputCosmosAddress) {
  const storedKey = localStorage.getItem(KEY_TAG + '-' + outputCosmosAddress)

  if (storedKey) {
    return { input_bitcoin_address: JSON.parse(storedKey).inputBitcoinAddress }
  }

  const response = await queryExchangeWallet(outputCosmosAddress)

  if (!response.data.error) {
    addToStorage(outputCosmosAddress, response.data.input_bitcoin_address)
  }

  return response.data
}

async function queryExchangeWallet(outputCosmosAddress) {
  const query =
    network.exchangeApiUrl +
    `/api/exchange?output_cosmos_address=${outputCosmosAddress}`
  try {
    const response = await axios.post(query)
    return response
  } catch (error) {
    return { data: { error: 'Something went wrong' } }
  }
}

function addToStorage(outputCosmosAddress, inputBitcoinAddress) {
  const storedExchangeWallet = {
    outputCosmosAddress,
    inputBitcoinAddress,
  }

  localStorage.setItem(
    KEY_TAG + '-' + outputCosmosAddress,
    JSON.stringify(storedExchangeWallet)
  )
}

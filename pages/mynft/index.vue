<template>
  <div class="swap2">
    <h3>
      Buddhead NFT Collection
      <CommonButton
        link="true"
        :href="collectionUrl"
        value="Mint on Stargaze!"
      />
    </h3>
    <div class="swap-card2">
      <div>
        <!--<h1>Buddhead collection</h1>-->
        <div v-for="index in myNft" :key="index.id" class="card">
          <!-- Image à la une -->
          <div class="card-image">
            <img :src="index.url" />
          </div>
          <!-- Fin de l'image à la une -->
          <!-- Corp de notre carte -->
          <div class="card-body">
            <!-- Date de publication de l'article-->
            Buddhead #{{ index.id }}
            <!-- Titre de l'article -->
            <div class="card-title"></div>
            <!-- Extrait de l'article -->
            <div class="card-excerpt">
              <br />
              <CommonButton
                link="true"
                :href="index.stargazeUrl"
                value="View on stargaze"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import bech32 from 'bech32'
import network from '~/common/network'

export default {
  name: `AppHeader`,
  data: () => ({
    isOpen: false,
    desktop: false,
    myNft: [],
    myNftDisplay: '',
    collectionUrl:
      'https://app.stargaze.zone/launchpad/stars1cpzvvmlrc9lcw3q5yrznax0uk5h6xww2d4ch9xve4xu8mfvgw2kqepnwd2',
    network,
  }),
  computed: {
    ...mapState(['session']),
  },
  async mounted() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
    if (this.session?.address) {
      const decode = bech32.decode(this.session.address)
      const starsAddr = await bech32.encode('stars', decode.words)

      console.log(starsAddr)
      const getMyNft = await axios.get(
        'https://nft-api.stargaze-apis.com/api/v1beta/profile/' +
          starsAddr +
          '/nfts'
      )
      const myNft = this.myNft
      getMyNft.data.forEach(function (item) {
        // console.log(item)
        if (
          item.collection.contractAddress ===
          'stars1w4dff5myjyzymk8tkpjrzj6gnv352hcdpt2dszweqnff927a9xmqc7e0gv'
        ) {
          console.log(item)
          myNft.push({
            url:
              'https://bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4.ipfs.nftstorage.link/images/' +
              item.tokenId +
              '.png',
            id: item.tokenId,
            stargazeUrl:
              'https://app.stargaze.zone/media/' +
              network.sg721 +
              '/' +
              item.tokenId,
          })
        }
      })
      /* const getMyNft = await axios.get(
        'https://api.stargaze.ezstaking.io/cosmos/tx/v1beta1/txs?events=wasm.minter=%27' +
          network.nftContract +
          '%27&events=wasm.recipient=%27' +
          starsAddr +
          '%27&events=message.action=%27/cosmwasm.wasm.v1.MsgExecuteContract%27'
      )
      const getMyTransfer = await axios.get(
        'https://api.stargaze.ezstaking.io/cosmos/tx/v1beta1/txs?events=wasm.recipient=%27' +
          starsAddr +
          '%27&events=message.action=%27/cosmwasm.wasm.v1.MsgExecuteContract%27&events=wasm.action=%27transfer_nft%27&events=execute._contract_address=%27' +
          network.sg721 +
          '%27'
      )
      const myNft = this.myNft
      getMyNft.data.tx_responses.forEach(function (item) {
        const found = item.logs[0].events.find(
          (element) => element.type === 'wasm'
        )
        const foundToken = found.attributes.find(
          (element) => element.key === 'token_id'
        )
        console.log(foundToken.value)
        myNft.push({
          url:
            'https://stargaze.mypinata.cloud/ipfs/bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4/images/' +
            foundToken.value +
            '.png',
          id: foundToken.value,
          stargazeUrl:
            'https://app.stargaze.zone/media/' +
            network.sg721 +
            '/' +
            foundToken.value,
        })
      })
      getMyTransfer.data.tx_responses.forEach(function (item) {
        const found = item.logs[0].events.find(
          (element) => element.type === 'wasm'
        )
        const foundToken = found.attributes.find(
          (element) => element.key === 'token_id'
        )
        myNft.push({
          url:
            'https://stargaze.mypinata.cloud/ipfs/bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4/images/' +
            foundToken.value +
            '.png',
          id: foundToken.value,
          stargazeUrl:
            'https://app.stargaze.zone/media/' +
            network.sg721 +
            '/' +
            foundToken.value,
        })
      }) */
    }
  },
  updated() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  methods: {
    close() {
      this.isOpen = false
    },
    open() {
      this.isOpen = true
    },
    watchWindowSize() {
      const w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )

      if (w >= 1024) {
        this.close()
        this.desktop = true
      } else {
        this.desktop = false
      }
    },
  },
}
</script>
<style>
.swap2 {
  padding: 0 1.5rem 3rem;
}

.swap-card2 {
  display: flex;
  flex-direction: column;
  background: var(--gray-1100);
  border-radius: var(--border-radius);
  padding: 2.5rem 2rem;
  position: relative;
  margin: 2rem 0;
  width: 100%;
}
.swap2 > h3 {
  font-size: 24px;
  color: var(--white);
  font-weight: 600;
  padding: 3rem 0 0;
}
.paragraph {
  margin-bottom: 15px;
  letter-spacing: 0.32px;
}

.card {
  width: 300px;
  background-color: #1c1d20;
  display: inline-block;
  margin: 0.9em;
}
.card a {
  color: #333;
  text-decoration: none;
}

.card-image {
  height: 450px;
  position: relative;
  overflow: hidden;
}
.card-image img {
  width: 150%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition-property: filter width;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}

.card-body {
  text-align: center;
  padding: 15px 20px;
  box-sizing: border-box;
}
</style>

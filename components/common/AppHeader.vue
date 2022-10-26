<template>
  <nav class="app-header">
    <div class="container" :class="{ open: isOpen }">
      <div class="header-item" :class="{ open: isOpen }">
        <nuxt-link to="/">
          <img
            class="network-icon"
            :src="require(`../../assets/images/${network.logo}`)"
            alt="network logo"
          />
          {{ network.name }}
        </nuxt-link>
        <div class="header-menu-section">
          <template v-if="!desktop">
            <div v-if="isOpen" class="close-menu" @click="close()">
              <i class="material-icons notranslate mobile-menu-action">close</i>
            </div>
            <div v-if="!isOpen" class="open-menu" @click="open()">
              <i class="material-icons notranslate mobile-menu-action"
                >more_vert</i
              >
            </div>
          </template>
        </div>
      </div>
      <div v-if="myNft.length > 0" align="center">
        <div v-if="desktop">
          <img :src="myNftDisplay" width="120" height="120" />
          <br />
        </div>
      </div>
      <div v-else align="center">
        <div v-if="desktop">
          <img
            :src="defaultNftDisplay"
            width="120"
            height="120"
            class="blurNft"
          />
          <br />
          <a
            class="app-menu-item textSize"
            href="https://app.stargaze.zone/launchpad/stars1cpzvvmlrc9lcw3q5yrznax0uk5h6xww2d4ch9xve4xu8mfvgw2kqepnwd2"
            title="View all"
          >
            You don't have a NFT yet!
          </a>
        </div>
      </div>
      <CommonAppMenu v-if="isOpen || desktop" @close="close" />
    </div>
  </nav>
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
    defaultNftDisplay:
      'https://stargaze.mypinata.cloud/ipfs/bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4/images/420.png',
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
          myNft.push(
            'https://stargaze.mypinata.cloud/ipfs/bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4/images/' +
              item.tokenId +
              '.png'
          )
        }
      })
      console.log(this.myNft[0])
      this.myNftDisplay = this.myNft[0]
      if (this.myNft.length > 1) {
        setInterval(() => {
          const values = Object.values(this.myNft)
          const randomValue = values[parseInt(Math.random() * values.length)]
          // console.log(randomValue)
          this.myNftDisplay = randomValue
        }, 2000)
      }
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
      console.log(getMyTransfer)
      const myNft = this.myNft
      getMyNft.data.tx_responses.forEach(function (item) {
        const found = item.logs[0].events.find(
          (element) => element.type === 'wasm'
        )
        const foundToken = found.attributes.find(
          (element) => element.key === 'token_id'
        )
        myNft.push(
          'https://stargaze.mypinata.cloud/ipfs/bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4/images/' +
            foundToken.value +
            '.png'
        )
      })
      getMyTransfer.data.tx_responses.forEach(function (item) {
        const found = item.logs[0].events.find(
          (element) => element.type === 'wasm'
        )
        const foundToken = found.attributes.find(
          (element) => element.key === 'token_id'
        )
        myNft.push(
          'https://stargaze.mypinata.cloud/ipfs/bafybeia45l2eflxa4xx7ii6mhekyhh5xnucudj5tzp2upzcoeqfl4uzdr4/images/' +
            foundToken.value +
            '.png'
        )
      })
      console.log(this.myNft)
      this.myNftDisplay = this.myNft[0]
      if (this.myNft.length > 1) {
        setInterval(() => {
          const values = Object.values(this.myNft)
          const randomValue = values[parseInt(Math.random() * values.length)]
          // console.log(randomValue)
          this.myNftDisplay = randomValue
        }, 2000)
      } */
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

<style scoped>
.app-header {
  z-index: var(--z-appHeader);
  position: relative;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: row;
}

.container {
  display: flex;
  flex-direction: row;
}

.app-header .header-item.open {
  background: var(--app-nav);
}

.mobile-menu-action {
  font-size: 1.5rem !important;
}

.app-header > .container {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  padding-top: 1.4rem;
}

.network-icon {
  height: 3rem;
  width: 3rem;
}

@media screen and (max-width: 1023px) {
  .app-header > .container.open {
    height: 100%;
    overflow: auto;
  }

  .app-header > .container {
    position: fixed;
    top: 0;
  }
}

.header-item-logo {
  height: 2rem;
  width: 6.5rem;
}

.header-menu-section {
  display: flex;
  align-items: center;
}

.header-menu-section > * {
  padding: 0 0.5rem;
}

.mobile-menu-action,
.header-menu-section a {
  color: var(--white);
}

.app-header .header-item {
  padding: 1.5rem 1.75rem;
  font-size: 0;
}

.app-header .header-item a {
  display: inline-block;
}

img {
  border-radius: 50%;
}
.blurNft {
  filter: blur(4px);
}
.textSize {
  font-size: 0.8em;
}

@media screen and (max-width: 1023px) {
  .app-header {
    width: 100%;
    min-height: 0;
  }

  .container {
    background: var(--app-nav);
    position: fixed;
    width: 100%;
  }

  .app-header .header-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
    color: var(--link);
    cursor: pointer;
  }

  .header-item-logo {
    height: 1.75rem;
  }
}

@media screen and (min-width: 1024px) {
  .app-header > .container {
    position: fixed;
    height: 100%;
    background: var(--app-nav);
  }
}
</style>

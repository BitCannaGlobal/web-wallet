<template>
  <div class="session-layout-out">
    <div class="half-block"></div>
    <div class="half-block bg-image"></div>
    <div class="session-layout lunie-light">
      <img
        class="network-icon"
        :src="require(`../assets/images/${network.logo}`)"
        alt="network logo"
      />
      <div class="session">
        <div v-if="$route.path !== '/welcome'" class="session-header">
          <div class="session-close">
            <a @click="closeModal()">
              <i class="material-icons notranslate circle back">close</i>
            </a>
          </div>
        </div>
        <Nuxt></Nuxt>
      </div>
      <div class="disclaimer">
        <p>
          Use this software at your own risk. Never enter your seed phrase into
          untrusted software. Beware of phishing scams and spoof sites. Have a
          nice day <span>✌️</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import network from '~/common/network'

export default {
  name: `SessionLayout`,
  components: {},
  middleware({ store }) {
    if (!store.state.data.api) {
      store.dispatch('data/init') // init api
    }
  },
  data: () => ({
    network,
  }),
  methods: {
    closeModal() {
      this.$router.push(`/welcome`)
    },
  },
}
</script>

<style>
.half-block {
  width: 50%;
  height: 100%;
  position: absolute;
}

.session-layout-out {
  position: relative;
  background: #0c1925 0% 0% no-repeat padding-box;
  opacity: 1;
}

.session-layout-out .network-icon {
  position: absolute;
  top: 30px;
  left: 30px;
  width: 50px;
}

.session-layout-out .bg-image {
  background: transparent url('../assets/images/bg_img.svg') 0% 0% no-repeat
    padding-box;
  background-size: 1200px;
  background-position: 20% 10%;
  opacity: 1;
  left: 50%;
}

@media screen and (max-width: 768px) {
  .session-layout-out .bg-image {
    background-size: 800px;
  }
}

.session-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  color: var(--white);
  background: transparent
    linear-gradient(
      299deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 72%,
      rgba(60, 193, 148, 0.3) 100%
    )
    0% 0% no-repeat padding-box;
  opacity: 1;
}

.session {
  display: flex;
  flex-direction: column;
  background: var(--gray-1100);
  border-radius: var(--border-radius);
  padding: 2.5rem 2rem;
  position: relative;
  max-width: 540px;
  margin: 2rem 0;
  width: 100%;
}

.session .session-close {
  text-align: right;
}

.session-title {
  font-size: var(--text-3xl);
  line-height: 42px;
  color: var(--bright);
  font-weight: 500;
  padding: 1rem 0;
  text-align: center;
}

.session-list {
  padding: 1rem 0;
}

.session-main {
  padding: 1rem 0;
}

.session-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem 0 1rem;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
}

.footnote {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: var(--text-sm);
}

.session-back {
  cursor: pointer;
  align-items: center;
  position: absolute;
  top: 40px;
}

.error-container {
  padding: 1rem;
  font-size: var(--text-base);
  color: var(--gray-600);
}

.error-container p {
  margin-bottom: 0.5rem;
}

.error {
  color: var(--red-600);
}

.session .material-icons.circle.back {
  color: var(--green-1000);
  border-radius: 50%;
  padding: 0.25rem;
  cursor: pointer;
  font-size: var(--text-base);
  border: 1px solid var(--green-1000);
}

.disclaimer {
  font-size: 11px;
  color: var(--red-700);
  text-align: center;
  line-height: 1rem;
  padding: 2rem;
  max-width: 540px;
  font-weight: 700;
  z-index: 2;
}

@media screen and (max-width: 667px) {
  .session-layout {
    background: var(--gray-1100);
  }

  .session {
    padding: 2rem 1rem;
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    margin: 0;
    min-height: 80vh;
  }

  .disclaimer {
    max-width: none;
  }
}
</style>

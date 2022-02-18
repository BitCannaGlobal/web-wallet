<template>
  <div class="copyable-address">
    <div
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      <a class="tooltip">
        {{ address | formatAddress }}
        <i class="material-icons notranslate">content_copy</i>
        <span>
          {{ address }}
          <br /><br />
          <qrcode-vue :value="address" size="150" level="L"></qrcode-vue>
        </span>
      </a>
    </div>
    <div :class="{ active: copySuccess }" class="copy-tooltip hide">
      <div class="arrow"></div>
      <div class="inner">Address Copied!</div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue'
import { formatAddress } from '~/common/address'

export default {
  name: `Address`,
  filters: {
    formatAddress,
  },
  components: {
    QrcodeVue,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    addressType: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    copySuccess: false,
  }),
  methods: {
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    },
  },
}
</script>
<style scoped>
.copyable-address {
  font-size: var(--text-sm);
}

.address {
  white-space: nowrap;
  align-items: center;
  cursor: pointer;
  color: var(--link);
}

.copyable-address .address:hover {
  color: var(--link-hover);
}

.copyable-address i {
  font-size: 14px;
  padding-left: 0.25rem;
}

.copy-tooltip {
  position: absolute;
  opacity: 0;
}

.copy-tooltip .inner {
  border-radius: 5px;
  background: var(--success);
  color: white;
  padding: 7px 10px;
  text-align: center;
  margin-top: 10px;
}

.copy-tooltip .arrow {
  left: 55px;
  width: 13px;
  height: 13px;
  background: var(--success);
  transform: rotate(45deg);
  top: 4px;
  position: absolute;
}

.copy-tooltip.active {
  opacity: 1;
}

a.tooltip {
  text-decoration: none;
}
a.tooltip:hover {
  position: relative;
}
a.tooltip span {
  display: none;
}
a.tooltip:hover span {
  border: var(--green-1000) 2px dotted;
  padding: 5px 20px 5px;
  display: block;
  z-index: 100;
  background: var(--gray-1200);
  margin: 15px;
  width: 360px;
  position: absolute;
  top: 15px;
  text-align: center;
}
</style>

<template>
  <div class="copyable-address">
    <div
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      <span>
        {{ address | formatAddress }}
        <i class="material-icons notranslate">content_copy</i>
      </span>
    </div>
    <div :class="{ active: copySuccess }" class="copy-tooltip hide">
      <div class="arrow"></div>
      <div class="inner">Address Copied!</div>
    </div>
  </div>
</template>

<script>
import { formatAddress } from '~/common/address'

export default {
  name: `Address`,
  filters: {
    formatAddress,
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
</style>

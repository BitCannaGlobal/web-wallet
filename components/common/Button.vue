<template>
  <a
    v-if="link"
    class="button"
    rel="nofollow noreferrer noopener"
    target="_blank"
    :href="href"
  >
    {{ value }}
  </a>
  <button
    v-else
    class="button"
    :class="{
      secondary: type === `secondary`,
      active: type === `active`,
      loading: loading,
    }"
    :disabled="disabled"
  >
    <svg
      v-if="loading"
      width="24"
      height="24"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#8c8fa6"
    >
      <g fill="none" fill-rule="evenodd">
        <g transform="translate(1 1)" stroke-width="2">
          <circle stroke="white" stroke-opacity=".2" cx="18" cy="18" r="18" />
          <path stroke="white" d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
    <template v-else>
      {{ value }}
    </template>
  </button>
</template>

<script>
export default {
  name: `Button`,
  props: {
    value: {
      type: String,
      default: null,
    },
    href: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    link: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.button {
  font-size: 14px;
  font-weight: 500;
  width: auto;
  min-width: 100px;
  padding: 8px 10px;
  color: var(--white);
  margin: 0;
  border-radius: var(--border-radius);
  cursor: pointer;
  background: var(--primary);
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  border: 2px solid var(--primary);
}

.button:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.button:disabled {
  opacity: 0.6;
  cursor: default;
}

.button:disabled:hover {
  background: var(--primary);
}

.button.secondary.active {
  background: var(--gray-200);
  color: var(--white);
}

.button.secondary {
  color: var(--bright);
  background: transparent;
  border: 2px solid var(--dim);
}

.button.secondary:disabled {
  color: var(--dim);
  background: transparent;
  border-color: var(--dim);
}

.button.secondary:hover:not(:disabled) {
  background: var(--gray-1300);
}

.addon-max {
  margin-left: 0.25rem;
}
</style>

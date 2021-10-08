<template>
  <div class="warning" :class="type">
    <slot name="title"> {{ title }} </slot>
    <slot name="message"> {{ message }}</slot>
  </div>
</template>

<script>
export default {
  name: `Warning`,
  props: {
    type: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: undefined,
    },
    message: {
      type: String,
      default: undefined,
    },
  },
}
</script>

<style scoped>
.warning {
  border: 2px solid var(--orange-600);
  border-radius: var(--border-radius);
  background: var(--gray-1100);
  padding: 1rem;
}

.warning h2 {
  font-weight: 700;
  font-size: var(--text-base);
  padding-bottom: 0.5rem;
}

.warning p {
  font-size: var(--text-xs);
  margin: 0;
}
</style>

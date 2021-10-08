<template>
  <div class="signout-swap">
    <SwapCard></SwapCard>
  </div>
</template>

<script>
export default {
  name: `PageSignoutSwap`,
  layout: 'session',
  middleware: 'swapEnabled',
}
</script>

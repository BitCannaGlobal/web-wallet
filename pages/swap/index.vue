<template>
  <div class="swap">
    <div class="swap-card">
      <SwapCard></SwapCard>
    </div>
  </div>
</template>

<script>
export default {
  name: `PageSwap`,
  middleware: ['addressRequired', 'swapEnabled'],
}
</script>

<style>
.swap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
}

.swap-card {
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
</style>

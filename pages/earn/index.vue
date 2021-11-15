<template>
  <div class="swap2">
    <h1>Earn</h1>
    <div class="swap-card2">
      <EarnCard></EarnCard>
    </div>
    <div class="swap-card2">
      <EarnTable></EarnTable>
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
.swap2 {
  line-height: 1.5;
  padding: 3rem 1.5rem;
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
</style>

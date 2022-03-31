<template>
  <div class="swap2">
    <h3>Earn</h3>
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
  middleware: ['addressRequired'],
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
</style>

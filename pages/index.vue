<template>
  <div class="portfolio">
    <PortfolioBalances />
    <PortfolioDelegations />
    <PortfolioUndelegations />
  </div>
</template>

<script>
export default {
  name: `PagePortfolio`,
  middleware: 'addressRequired',
}
</script>
<style scoped>
.portfolio {
  background: var(--gray-1200);
  min-height: 100vh;
}
</style>

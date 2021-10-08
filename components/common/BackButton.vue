<template>
  <button class="back-button" @click="$router.go(-1)">
    <i class="material-icons notranslate arrow">arrow_back</i>
    Back
  </button>
</template>

<script>
export default {
  name: `BackButton`,
}
</script>

<style scoped>
.back-button {
  padding: 0.5rem 1rem;
  width: auto;
  font-size: 14px;
  background: transparent;
  color: var(--white);
  border: 2px solid var(--white);
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.back-button i {
  padding-right: 1rem;
  font-size: 1rem;
}

.back-button:hover {
  background-color: var(--gray-1200);
}
</style>

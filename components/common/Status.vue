<template>
  <div class="status" :class="label.toLowerCase()">
    {{ label }}
  </div>
</template>

<script>
export default {
  name: `Status`,
  props: {
    label: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
.status {
  text-transform: uppercase;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--border-radius);
  width: fit-content;
  text-align: center;
}

.status.inactive {
  color: var(--white);
  border: 1px solid var(--orange-800);
}

.status.passed,
.status.active {
  color: var(--white);
  border: 1px solid var(--green-1000);
}

.status.rejected {
  color: var(--white);
  border: 1px solid var(--red-800);
}

.status.voting {
  color: var(--white);
  border: 1px solid var(--teal-800);
}

.status.depositing {
  color: var(--white);
  border: 1px solid var(--purple-800);
}
</style>

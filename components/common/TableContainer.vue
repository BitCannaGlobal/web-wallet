<template>
  <div class="container">
    <div v-if="!loaded">
      <CommonLoader />
    </div>
    <table v-else-if="length" class="table">
      <thead>
        <CommonTableHeader
          :sort="sort"
          :properties="columns"
          :show-row-count="showRowCount"
        />
      </thead>
      <tbody>
        <slot></slot>
      </tbody>
    </table>
    <template v-else-if="!length">
      <slot name="empty">
        <tr class="no-results">
          No Results
        </tr>
      </slot>
    </template>
  </div>
</template>

<script>
export default {
  name: 'CommonTableContainer',
  props: {
    length: {
      type: Number,
      default: () => 0,
    },
    columns: {
      type: Array,
      required: true,
    },
    search: {
      type: Boolean,
      default: false,
    },
    sort: {
      type: Object,
      default: () => {},
    },
    loaded: {
      type: Boolean,
      default: false,
    },
    showRowCount: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      searchTerm: false,
    }
  },
}
</script>

<style scoped>
.container {
  overflow: auto;
  border-radius: var(--border-radius);
  background: var(--gray-1100);
}

table {
  table-layout: auto;
  border-collapse: collapse;
  min-width: 100%;
}

.no-results {
  padding: 2rem;
  height: 4rem;
  display: table-cell;
  color: var(--txt);
  font-size: var(--text-sm);
}

.no-results h2 {
  font-weight: 600;
  padding-bottom: 0.5rem;
  color: var(--bright);
  font-size: var(--text-lg);
}

thead {
  border-bottom: 2px solid var(--bc-dim);
}
</style>

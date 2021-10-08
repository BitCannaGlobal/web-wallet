<template>
  <div>
    <div class="filterContainer">
      <CommonField
        v-model="searchTerm"
        class="searchField"
        placeholder="Search"
      />
      <div class="filterOptions">
        <div class="toggles">
          <CommonButton
            value="All"
            class="toggle-button"
            :type="allValidators ? `active` : `secondary`"
            @click.native="defaultSelectorsController(`allValidators`)"
          />
          <CommonButton
            value="Active"
            class="toggle-button"
            :type="activeOnly ? `active` : `secondary`"
            @click.native="defaultSelectorsController(`activeOnly`)"
          />
        </div>
      </div>
    </div>

    <StakingTableValidators
      class="table-validators"
      :validators="filteredValidators"
      :delegations="delegations"
      :rewards="rewards"
      :search-term="searchTerm ? true : false"
      :loaded="validatorsLoaded"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `PageValidators`,
  data: () => ({
    searchTerm: '',
    activeOnly: true,
    allValidators: false,
  }),
  computed: {
    ...mapState('data', [
      'validators',
      'validatorsLoaded',
      'delegations',
      'delegationsLoaded',
      'rewards',
    ]),
    filteredValidators() {
      if (this.searchTerm) {
        return this.sortedValidators.filter(({ name, operatorAddress }) => {
          return (
            name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            operatorAddress
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          )
        })
      } else {
        return this.sortedValidators
      }
    },
    sortedValidators() {
      if (this.allValidators) {
        return this.validators
      } else {
        return this.validators.filter(({ status }) => status === 'ACTIVE')
      }
    },
  },
  methods: {
    defaultSelectorsController(selector) {
      this.allValidators = false
      this.activeOnly = false

      if (selector === `allValidators`) {
        this.allValidators = true
      }
      if (selector === `activeOnly`) {
        this.activeOnly = true
      }
    },
  },
}
</script>

<style scoped>
.table-validators {
  margin: 1.5rem;
}

.filterContainer {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  background: var(--gray-1100);
}

.searchField {
  max-width: 500px;
}

.toggles {
  margin-bottom: 0;
  display: inline-flex;
}

.filterContainer input {
  max-width: 300px;
}

.toggles .toggle-button {
  min-width: 100px;
  border-radius: 0;
  background: var(--gray-1200);
  color: var(--txt);
  border-color: var(--input-bc);
}

.toggle-button.active {
  background: var(--green-1000);
  border: none;
}

.toggle-button:last-child {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  margin-left: -1px;
  border: none;
}

.toggle-button:first-child {
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  margin-right: -1px;
  border: none;
}

.toggles .toggle-button.active:hover:not(:disabled) {
  background: var(--green-1000);
}

.toggles .toggle-button.secondary:hover:not(:disabled) {
  background: var(--gray-1200);
}

.filterOptions {
  padding-left: 0.5rem;
}

.filter-toggle {
  margin-left: 1em;
}
</style>

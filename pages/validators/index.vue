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
    <div class="data-row">
      <div>
        <h4 class="icon">
          <img src="icon/height.png" />
          &ensp; Height
        </h4>
        <p class="text-block">
          {{ block.height }}
        </p>
      </div>
      <div>
        <h4 class="icon">
          <img src="icon/validator.png" />
          &ensp; Validators
        </h4>
        <p class="text-block">{{ countValidators }}</p>
      </div>
      <div>
        <h4 class="icon">
          <img src="icon/tokens.png" />
          &ensp; Bonded coins
        </h4>
        <p class="text-block">
          {{ finalBonded | bigFigureOrShortDecimals }}
        </p>
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
import { bigFigureOrShortDecimals } from '~/common/numbers'

export default {
  name: `PageValidators`,
  filters: {
    bigFigureOrShortDecimals,
  },
  data: () => ({
    searchTerm: '',
    activeOnly: true,
    allValidators: false,
  }),
  computed: {
    ...mapState('data', [
      'block',
      'validators',
      'validatorsLoaded',
      'delegations',
      'delegationsLoaded',
      'rewards',
      'validatorInfoPage',
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
    finalBonded() {
      const boundedRound = this.validatorInfoPage.bonded_tokens / 1000000
      return boundedRound.toFixed(0)
    },
    countValidators() {
      const countVal = Object.keys(this.sortedValidators).length
      return countVal
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
// document.querySelector('#img').style.transform = 'rotate(90deg)'
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-self: center;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem 0;
}

.data-row div {
  font-size: 22px;
  color: var(--txt);
  padding: 1rem 1.5rem;
  width: 100%;
  white-space: nowrap;
  border-radius: var(--border-radius);
  background: var(--gray-1100);
}

.text-block {
  text-align: right;
}

.data-row > div {
  margin-right: 1rem;
}
.data-row div:last-child {
  margin-right: 0;
}
.proposals .card {
  margin: 0;
}

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

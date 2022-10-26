import { cosmos } from '@cosmostation/extension-client'

export const state = () => ({
  accounts: [],
  initialized: false,
  error: undefined,
  loading: false,
})

export const mutations = {
  setAccounts(state, accounts) {
    state.accounts = accounts
  },
  setInitialized(state) {
    state.initialized = true
  },
  setError(state, error) {
    state.error = error
  },
  setLoading(state, loading) {
    state.loading = loading
  },
}

export const actions = {
  async init({ commit, dispatch }, trys = 0) {
    commit('setError', undefined)
    commit('setLoading', true)

    try {
      const provider = await cosmos()
      const account = await provider.requestAccount('bitcanna')
      commit('setAccounts', account)
      commit('setInitialized')
    } catch (error) {
      commit('setLoading', false)
      commit('setError', 'not installed')
      return
    }
    commit('setLoading', false)
  },
}

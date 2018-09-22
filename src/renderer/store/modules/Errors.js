const mutations = {
  NEW_ERROR (state, error) {}
}

const actions = {
  default ({ commit }, message) {
    commit('NEW_ERROR', { message })
  },
  persist ({ commit }, message) {
    commit('NEW_ERROR', { message, persist: true })
  },
  persistWarning ({ commit }, message) {
    commit('NEW_ERROR', { message, type: 'warning', persist: true })
  },
  warning ({ commit }, message) {
    commit('NEW_ERROR', { message, type: 'warning' })
  }
}

export default {
  namespaced: true,
  mutations,
  actions
}

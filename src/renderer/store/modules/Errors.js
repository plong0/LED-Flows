const mutations = {
  NEW_ERROR (state, error) {}
}

const actions = {
  default ({ commit }, message) {
    commit('NEW_ERROR', {message})
  },
  persist ({ commit }, message) {
    commit('NEW_ERROR', {message, persist: true})
  }
}

export default {
  namespaced: true,
  mutations,
  actions
}

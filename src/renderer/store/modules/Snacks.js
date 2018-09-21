const state = {
  snacks: []
}

const getters = {
  next (state) {
    if (state.snacks.length) {
      return state.snacks[0]
    }
  }
}

const mutations = {
  CONSUME (state) {
    state.snacks.shift()
  },
  NEW_SNACK (state, snack) {
    state.snacks.push(snack)
  }
}

const actions = {
  consume ({ commit, state }, snack) {
    if (snack && snack === getters.next(state)) {
      commit('CONSUME')
    }
  },
  create ({ commit, state }, {message, type = 'info', timeout = 15}) {
    if (message && type) {
      commit('NEW_SNACK', {message, type, timeout})
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

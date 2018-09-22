const state = {
  snacks: []
}

const getters = {
  count (state) {
    return state.snacks.length
  },
  nextSnack (state) {
    if (state.snacks.length) {
      return state.snacks[0]
    }
  },
  snacks (state) {
    return state.snacks
  }
}

const mutations = {
  CONSUME (state) {
    state.snacks.shift()
  },
  CONSUMED (state, { snack, hasMore }) {
  },
  NEW_SNACK (state, snack) {
    state.snacks.push(snack)
  }
}

const actions = {
  consumeSnack ({ commit, state }, snack) {
    if (snack && snack === getters.nextSnack(state)) {
      commit('CONSUME')
      commit('CONSUMED', {snack, hasMore: getters.count(state)})
    }
  },
  createSnack ({ commit, state }, { message, type = 'info', timeout, dismissable = true, color }) {
    if (message && type) {
      commit('NEW_SNACK', {message, type, timeout, dismissable, color})
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

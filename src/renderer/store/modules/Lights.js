const state = {
  lights: []
}

const getters = {
  lights: (state) => {
    return state.lights
  },
  light: (state) => (id) => {
    if (id || id === 0) {
      return state.lights.find((item) => {
        return (item.id === id)
      })
    }
  },
  nextID: (state) => {
    let maxID = -1
    for (let light of state.lights) {
      if (!isNaN(light.id) && light.id > maxID) {
        maxID = light.id
      }
    }
    return (maxID + 1)
  }
}

const mutations = {
  ADD_LIGHT (state, light) {
    state.lights.push(light)
  }
}

const actions = {
  addLight ({ commit, dispatch, state }, light) {
    if (light && (light.id || light.id === 0)) {
      if (!getters.light(state)(light.id)) {
        commit('ADD_LIGHT', light)
      } else {
        dispatch('Errors/default', `Light already exists with ID ${light.id}`, {root: true})
      }
    } else {
      dispatch('Errors/default', `Light must have an ID`, {root: true})
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

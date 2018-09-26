import Vue from 'vue'

const state = {
  activeLight: null,
  lights: {}
}

const getters = {
  activeLight: (state) => state.activeLight,
  light: (state) => (id) => state.lights[id],
  lights: (state) => Object.keys(state.lights).sort((a, b) => (parseInt(a) - parseInt(b))).map(id => state.lights[id]),
  lightAddress: (state, getters) => (id, address) => {
    const light = getters.light(id)
    if (light && address >= 0 && address < light.LEDs.length) {
      return light.LEDs[address]
    }
  },
  nextID: (state) => {
    const keys = Object.keys(state.lights).map(id => parseInt(id))
    return (keys.length ? Math.max(...keys) + 1 : 0)
  }
}

const mutations = {
  ACTIVATE_LIGHT (state, light) {
    Vue.set(state, 'activeLight', light)
  },
  ADD_LIGHT (state, light) {
    Vue.set(state.lights, light.id, light)
  },
  DELETE_LIGHT (state, light) {
    Vue.delete(state.lights, light.id)
  },
  SET_LIGHT (state, light) {
    Vue.set(state.lights, light.id, light)
  },
  UPDATE_LIGHT (state, { light, updates }) {
    for (let prop in updates) {
      Vue.set(light, prop, updates[prop])
    }
  },
  FILL_ADDRESSES (state, { light, upTo }) {
    // append as many empty address arrays as needed to have (upTo + 1) entries (counting starts at 0 and upTo is a target address)
    const newLEDs = Array(1 + upTo - light.LEDs.length).fill().map(() => [])
    light.LEDs.push(...newLEDs)
  },
  ADD_LEDS (state, { light, LEDs, address }) {
    // address is required to be explicitly set so subscribers know
    // concatenate to existing address
    light.LEDs[address].push(...LEDs)
  }
}

const actions = {
  activateLight ({ commit, getters }, light = null) {
    if (light === null || (light && light.hasOwnProperty('id'))) {
      if (light !== null) {
        light = getters.light(light.id)
      }
      commit('ACTIVATE_LIGHT', light)
    }
  },
  createLight ({ commit, getters }, { name = 'New Light' } = {}) {
    const light = {
      id: getters.nextID,
      name,
      LEDs: []
    }
    commit('ADD_LIGHT', light)
    return light
  },
  deleteLight ({ commit, getters }, light) {
    if (light && light.hasOwnProperty('id')) {
      const oldLight = getters.light(light.id)
      if (oldLight) {
        commit('DELETE_LIGHT', oldLight)
      }
      return oldLight
    }
  },
  setLight ({ commit }, light) {
    if (light && light.hasOwnProperty('id')) {
      if (!light.hasOwnProperty('LEDs')) {
        light.LEDs = []
      }
      commit('SET_LIGHT', light)
      return light
    }
  },
  updateLight ({ commit, getters }, { id, ...updates }) {
    const light = getters.light(id)
    if (light) {
      commit('UPDATE_LIGHT', { light, updates })
      return light
    }
  },
  addLED ({ dispatch }, { light, LED = { x: 0, y: 0 }, address = -1 }) {
    return dispatch('addLEDs', { light, address, LEDs: [LED] })
  },
  addLEDs ({ commit, getters, dispatch }, { light: { id, ..._light }, LEDs = [], address = -1 }) {
    if (!LEDs.length) {
      return
    }
    const light = getters.light(id)
    if (light) {
      if (address < 0) {
        // push next address if none given
        address = light.LEDs.length
      }
      dispatch('assertAddress', { light, address }).then(() => {
        commit('ADD_LEDS', { light, LEDs, address })
      })
    }
  },
  assertAddress ({ commit, getters }, { light: { id, ..._light }, address }) {
    const light = getters.light(id)
    if (light && light.LEDs.length <= address) {
      commit('FILL_ADDRESSES', { light, upTo: address })
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

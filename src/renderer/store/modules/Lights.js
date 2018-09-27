import Vue from 'vue'

const state = {
  active: {
    light: null
  },
  lights: {}
}

const getters = {
  activeLight: (state) => state.active.light,
  addressCount: (state, getters) => (id) => {
    const light = getters.light(id)
    if (light) {
      return light.LEDs.length
    }
    return 0
  },
  addressFirst: (state, getters) => (id) => {
    const light = getters.light(id)
    if (light && light.LEDs.length) {
      if (light.addressOffset === null) {
        let offset = 0
        const lights = getters.lights
        for (let i = 0; i < lights.length; i++) {
          if (lights[i]) {
            if (lights[i].id === id) {
              break
            } else {
              offset += getters.addressCount(lights[i].id)
            }
          }
        }
        return offset
      }
      return light.addressOffset
    }
    return '?'
  },
  addressLast: (state, getters) => (id) => {
    const light = getters.light(id)
    if (light && light.LEDs.length) {
      const firstAddress = getters.addressFirst(id)
      const addressOffset = getters.addressCount(id) - (light.LEDs.length ? 1 : 0)
      if (!isNaN(firstAddress)) {
        return firstAddress + addressOffset
      } else {
        return `(+${addressOffset})`
      }
    }
    return '?'
  },
  ledCount: (state, getters) => (id) => {
    const light = getters.light(id)
    if (light && light.LEDs.length) {
      let count = 0
      for (let address of light.LEDs) {
        count += address.length
      }
      return count
    }
    return 0
  },
  light: (state) => (id) => state.lights[id],
  lights: (state) => Object.keys(state.lights).sort((a, b) => (parseInt(a) - parseInt(b))).map(id => state.lights[id]),
  nextID: (state) => {
    const keys = Object.keys(state.lights).map(id => parseInt(id))
    return (keys.length ? Math.max(...keys) + 1 : 0)
  }
}

const mutations = {
  ACTIVATE_LIGHT (state, light) {
    Vue.set(state.active, 'light', light)
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
      commit('ACTIVATE_LIGHT', light, light === null)
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
    if (isNaN(address) || address === null) {
      address = -1
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
  },
  createLight ({ commit, getters }, { name = 'New Light', location = { x: 0, y: 0 }, addressOffset = null } = {}) {
    if (!location) {
      location = {}
    }
    if (!location.hasOwnProperty('x')) {
      location.x = 0
    }
    if (!location.hasOwnProperty('y')) {
      location.y = 0
    }
    const light = {
      id: getters.nextID,
      name,
      addressOffset,
      LEDs: [],
      location
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

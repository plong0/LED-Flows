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
  bounds: (state, getters) => (id) => {
    const light = getters.light(id)
    let bounds = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      center: {
        x: 0,
        y: 0
      },
      width: 0,
      height: 0
    }
    if (light && light.LEDs.length) {
      const leds = light.LEDs.reduce((result, LEDs) => {
        const address = LEDs.reduce((result, LED) => {
          if (isNaN(result.minX) || LED.x < result.minX) result.minX = LED.x
          if (isNaN(result.maxX) || LED.x > result.maxX) result.maxX = LED.x
          if (isNaN(result.minY) || LED.y < result.minY) result.minY = LED.y
          if (isNaN(result.maxY) || LED.y > result.maxY) result.maxY = LED.y
          return result
        }, { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN })
        if (isNaN(result.minX) || address.minX < result.minX) result.minX = address.minX
        if (isNaN(result.maxX) || address.maxX > result.maxX) result.maxX = address.maxX
        if (isNaN(result.minY) || address.minY < result.minY) result.minY = address.minY
        if (isNaN(result.maxY) || address.maxY > result.maxY) result.maxY = address.maxY
        return result
      }, { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN })
      bounds.left = leds.minX
      bounds.right = leds.maxX
      bounds.top = leds.minY
      bounds.bottom = leds.maxY
      bounds.center = {
        x: (leds.minX + leds.maxX) / 2.0,
        y: (leds.minY + leds.maxY) / 2.0
      }
      bounds.width = (leds.maxX - leds.minX)
      bounds.height = (leds.maxY - leds.minY)
    }
    return bounds
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
  createLight ({ commit, getters }, { name = 'New Light', addressOffset = null } = {}) {
    const light = {
      id: getters.nextID,
      name,
      addressOffset,
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

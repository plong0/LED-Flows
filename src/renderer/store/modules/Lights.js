import Vue from 'vue';

const state = {
  lights: {}
};

const getters = {
  addressCount: (state, getters) => (id) => {
    const light = getters.light(id);
    if (light) {
      return light.LEDs.length;
    }
    return 0;
  },
  addressFirst: (state, getters) => (id) => {
    const light = getters.light(id);
    if (light && light.LEDs.length) {
      if (light.addressOffset === null) {
        let offset = 0;
        const lights = getters.lights;
        for (let i = 0; i < lights.length; i++) {
          if (lights[i]) {
            if (lights[i].id === id) {
              break;
            } else {
              offset += getters.addressCount(lights[i].id);
            }
          }
        }
        return offset;
      }
      return light.addressOffset;
    }
    return '?';
  },
  addressLast: (state, getters) => (id) => {
    const light = getters.light(id);
    if (light && light.LEDs.length) {
      const firstAddress = getters.addressFirst(id);
      const addressOffset = getters.addressCount(id) - (light.LEDs.length ? 1 : 0);
      if (!isNaN(firstAddress)) {
        return firstAddress + addressOffset;
      } else {
        return `(+${addressOffset})`;
      }
    }
    return '?';
  },
  bounds: (state, getters) => (id) => {
    const light = getters.light(id);
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
    };
    if (light && light.LEDs.length) {
      const lightBounds = light.LEDs.reduce((result, address) => {
        const addressBounds = address.LEDs.reduce((result, LED) => {
          if (isNaN(result.minX) || LED.x < result.minX) result.minX = LED.x;
          if (isNaN(result.maxX) || LED.x > result.maxX) result.maxX = LED.x;
          if (isNaN(result.minY) || LED.y < result.minY) result.minY = LED.y;
          if (isNaN(result.maxY) || LED.y > result.maxY) result.maxY = LED.y;
          return result;
        }, { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN });
        if (isNaN(result.minX) || addressBounds.minX < result.minX) result.minX = addressBounds.minX;
        if (isNaN(result.maxX) || addressBounds.maxX > result.maxX) result.maxX = addressBounds.maxX;
        if (isNaN(result.minY) || addressBounds.minY < result.minY) result.minY = addressBounds.minY;
        if (isNaN(result.maxY) || addressBounds.maxY > result.maxY) result.maxY = addressBounds.maxY;
        return result;
      }, { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN });
      bounds.left = lightBounds.minX;
      bounds.right = lightBounds.maxX;
      bounds.top = lightBounds.minY;
      bounds.bottom = lightBounds.maxY;
      bounds.center = {
        x: (lightBounds.minX + lightBounds.maxX) / 2.0,
        y: (lightBounds.minY + lightBounds.maxY) / 2.0
      };
      bounds.width = (lightBounds.maxX - lightBounds.minX);
      bounds.height = (lightBounds.maxY - lightBounds.minY);
    }
    return bounds;
  },
  ledCount: (state, getters) => (id) => {
    const light = getters.light(id);
    if (light && light.LEDs.length) {
      let count = 0;
      for (let address of light.LEDs) {
        count += address.LEDs.length;
      }
      return count;
    }
    return 0;
  },
  light: (state) => (id) => state.lights[id],
  lights: (state) => Object.keys(state.lights).sort((a, b) => (parseInt(a) - parseInt(b))).map(id => state.lights[id]),
  nextID: (state) => {
    const keys = Object.keys(state.lights).map(id => parseInt(id));
    return (keys.length ? Math.max(...keys) + 1 : 0);
  }
};

const mutations = {
  ADD_LIGHT (state, light) {
    Vue.set(state.lights, light.id, light);
  },
  DELETE_LIGHT (state, light) {
    Vue.delete(state.lights, light.id);
  },
  SET_LIGHT (state, light) {
    Vue.set(state.lights, light.id, light);
  },
  UPDATE_LIGHT (state, { light, updates }) {
    for (let prop in updates) {
      Vue.set(light, prop, updates[prop]);
    }
  },
  ADD_LEADS (state, { light, leads, address, index }) {
    // address is required to be explicitly set so subscribers know
    // concatenate to existing address
    light.LEDs[address].leads.splice(index, 0, ...leads);
  },
  ADD_LEDS (state, { light, LEDs, address }) {
    // address is required to be explicitly set so subscribers know
    // concatenate to existing address
    light.LEDs[address].LEDs.push(...LEDs);
  },
  DELETE_ADDRESS (state, { light, address }) {
    Vue.delete(light.LEDs, address);
  },
  DELETE_LEAD (state, { light, address, index }) {
    light.LEDs[address].leads.splice(index, 1);
  },
  DELETE_LED (state, { light, address, index }) {
    light.LEDs[address].LEDs.splice(index, 1);
  },
  FILL_ADDRESSES (state, { light, upTo }) {
    // append as many empty address arrays as needed to have (upTo + 1) entries (counting starts at 0 and upTo is a target address)
    const newLEDs = Array(1 + upTo - light.LEDs.length).fill().map(() => ({
      leads: [],
      LEDs: []
    }));
    light.LEDs.push(...newLEDs);
  },
  MOVE_LEAD (state, { light, address, index, point }) {
    let lead = light.LEDs[address].leads[index];
    Vue.set(lead, 'x', point.x);
    Vue.set(lead, 'y', point.y);
  },
  MOVE_LED (state, { light, address, index, point }) {
    let LED = light.LEDs[address].LEDs[index];
    Vue.set(LED, 'x', point.x);
    Vue.set(LED, 'y', point.y);
  },
  SHIFT_ADDRESSES (state, { light, from, amount }) {
    const newLEDs = Array(amount).fill().map(() => ({
      leads: [],
      LEDs: []
    }));
    light.LEDs.splice(from, 0, ...newLEDs);
  },
  TRANSFER_LEADS (state, { light, from, to, start, count, insert }) {
    const leads = light.LEDs[from].leads.splice(start, count || light.LEDs[from].leads.length);
    light.LEDs[to].leads.splice(insert, 0, ...leads);
  }
};

const actions = {
  addLead ({ dispatch }, { light, lead = { x: 0, y: 0 }, address = -1, index = -1 }) {
    return dispatch('addLeads', { light, address, index, leads: [lead] });
  },
  addLeads ({ commit, getters, dispatch }, { light: { id, ..._light }, leads = [], address = -1, index = -1 }) {
    leads = leads.filter(lead => lead);
    if (!leads.length) {
      return;
    }
    if (isNaN(address) || address === null) {
      address = -1;
    }
    if (isNaN(index) || index === null) {
      index = -1;
    }
    const light = getters.light(id);
    if (light) {
      if (address < 0) {
        // push next address if none given
        address = light.LEDs.length;
      }
      dispatch('assertAddress', { light, address }).then((_address) => {
        if (index < 0) {
          index = _address.leads.length;
        }
        commit('ADD_LEADS', { light, leads, address, index });
      });
    }
  },
  addLED ({ dispatch }, { light, LED = { x: 0, y: 0 }, address = -1, stack = true }) {
    return dispatch('addLEDs', { light, address, LEDs: [LED], stack });
  },
  addLEDs ({ commit, getters, dispatch }, { light: { id, ..._light }, LEDs = [], address = -1, stack = true }) {
    LEDs = LEDs.filter(LED => LED);
    if (!LEDs.length) {
      return;
    }
    if (isNaN(address) || address === null) {
      address = -1;
    }
    const light = getters.light(id);
    if (light) {
      if (address < 0) {
        // push next address if none given
        address = light.LEDs.length;
      }
      if (!stack && address < light.LEDs.length) {
        commit('SHIFT_ADDRESSES', { light, from: address, amount: LEDs.length });
      }
      dispatch('assertAddress', { light, address }).then(() => {
        commit('ADD_LEDS', { light, LEDs, address });
      });
    }
  },
  assertAddress ({ commit, getters }, { light: { id, ..._light }, address }) {
    const light = getters.light(id);
    if (light && light.LEDs.length <= address) {
      commit('FILL_ADDRESSES', { light, upTo: address });
    }
    return light.LEDs[address];
  },
  createLight ({ commit, getters }, { name = 'New Light', addressOffset = null } = {}) {
    const light = {
      id: getters.nextID,
      name,
      addressOffset,
      LEDs: []
    };
    commit('ADD_LIGHT', light);
    return light;
  },
  deleteLead ({ commit, getters }, { light: { id, ..._light }, address, index }) {
    const light = getters.light(id);
    if (light && address >= 0 && address < light.LEDs.length && index >= 0 && index < light.LEDs[address].leads.length) {
      commit('DELETE_LEAD', { light, address, index });
      if (!light.LEDs[address].LEDs.length && !light.LEDs[address].leads.length) {
        commit('DELETE_ADDRESS', { light, address });
      }
    }
  },
  deleteLED ({ commit, dispatch, getters }, { light: { id, ..._light }, address, index }) {
    const light = getters.light(id);
    if (light && address >= 0 && address < light.LEDs.length && index >= 0 && index < light.LEDs[address].LEDs.length) {
      commit('DELETE_LED', { light, address, index });
      if (!light.LEDs[address].LEDs.length) {
        if (light.LEDs[address].leads.length) {
          if (address < getters.addressCount(light.id) - 1) {
            dispatch('transferLeads', { light, from: address, to: address + 1 }).then(() => {
              commit('DELETE_ADDRESS', { light, address });
            });
          }
        } else {
          commit('DELETE_ADDRESS', { light, address });
        }
      }
    }
  },
  deleteLight ({ commit, getters }, light) {
    if (light && light.hasOwnProperty('id')) {
      const oldLight = getters.light(light.id);
      if (oldLight) {
        commit('DELETE_LIGHT', oldLight);
      }
      return oldLight;
    }
  },
  moveLead ({ commit, getters }, { light: { id, ..._light }, address, index, delta }) {
    const light = getters.light(id);
    if (light && address >= 0 && address < light.LEDs.length && index >= 0 && index < light.LEDs[address].leads.length) {
      const lead = light.LEDs[address].leads[index];
      const point = {
        x: lead.x + delta.x,
        y: lead.y + delta.y
      };
      commit('MOVE_LEAD', { light, address, index, point });
    }
  },
  moveLED ({ commit, getters }, { light: { id, ..._light }, address, index, delta }) {
    const light = getters.light(id);
    if (light && address >= 0 && address < light.LEDs.length && index >= 0 && index < light.LEDs[address].LEDs.length) {
      const LED = light.LEDs[address].LEDs[index];
      const point = {
        x: LED.x + delta.x,
        y: LED.y + delta.y
      };
      commit('MOVE_LED', { light, address, index, point });
    }
  },
  setLight ({ commit }, light) {
    if (light && light.hasOwnProperty('id')) {
      if (!light.hasOwnProperty('LEDs')) {
        light.LEDs = [];
      }
      commit('SET_LIGHT', light);
      return light;
    }
  },
  transferLeads ({ commit, getters }, { light: { id, ..._light }, from, to, start = 0, count, insert = 0 }) {
    const light = getters.light(id);
    if (light && from >= 0 && from < light.LEDs.length && to >= 0 && to < light.LEDs.length && start < light.LEDs[from].leads.length) {
      commit('TRANSFER_LEADS', { light, from, to, start, count, insert });
    }
  },
  updateLight ({ commit, getters }, { id, ...updates }) {
    const light = getters.light(id);
    if (light) {
      commit('UPDATE_LIGHT', { light, updates });
      return light;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

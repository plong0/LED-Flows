import Vue from 'vue';

const state = {
  active: {
    light: null
  }
};
const getters = {
  activeLight: (state) => state.active.light
};
const mutations = {
  ACTIVATE_LIGHT (state, light) {
    Vue.set(state.active, 'light', light);
  }
};
const actions = {
  activateLight ({ commit, rootGetters }, light = null) {
    if (light === null || (light && light.hasOwnProperty('id'))) {
      if (light !== null) {
        light = rootGetters['Lights/light'](light.id);
      }
      commit('ACTIVATE_LIGHT', light);
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

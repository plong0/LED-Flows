import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/led-map/lights',
      alias: '/lights',
      name: 'lights',
      components: {
        default: require('@/components/LEDMap/LEDMap').default,
        manager: require('@/components/Lights/LightManager').default
      }
    },
    {
      path: '/led-map/currents',
      alias: '/currents',
      name: 'currents',
      components: {
        default: require('@/components/LEDMap/LEDMap').default,
        manager: require('@/components/Currents/CurrentManager').default
      }
    },
    {
      path: '/settings',
      name: 'settings'
    },
    {
      path: '*',
      redirect: '/lights'
    }
  ]
})

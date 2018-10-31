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
      path: '/led-map/flows',
      alias: '/flows',
      name: 'flows',
      components: {
        default: require('@/components/LEDMap/LEDMap').default,
        manager: require('@/components/Flows/FlowManager').default
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

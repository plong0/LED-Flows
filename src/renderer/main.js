import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App'
import router from './router'
import store from './store'

import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    'primary': colors.deepPurple.lighten1,
    'secondary': colors.indigo.lighten1,
    'accent': colors.teal.lighten1,
    'error': colors.red.darken1,
    'info': colors.blue.darken2,
    'success': colors.green.darken1,
    'warning': colors.amber.darken3
  }
})
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

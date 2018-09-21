import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App'
import router from './router'
import store from './store'

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    'primary': '#7e57c2',
    'secondary': '#7986cb',
    'accent': '#558b2f',
    'error': '#b71c1c',
    'info': '#3f51b5',
    'success': '#00796b',
    'warning': '#ff8f00'
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

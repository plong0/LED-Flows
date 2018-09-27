const files = require.context('.', false, /\.js$/)
const filters = {}

files.keys().forEach(key => {
  if (key === './index.js') return
  filters[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

export default {
  install (Vue) {
    for (let name in filters) {
      Vue.filter(name, filters[name])
    }
  }
}

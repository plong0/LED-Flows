const files = require.context('.', false, /\.js$/)
const shapes = {}

files.keys().forEach(key => {
  if (key === './index.js') return
  shapes[key.replace(/(\.\/|\.js)/g, '')] = (files(key).default)
})

export default shapes

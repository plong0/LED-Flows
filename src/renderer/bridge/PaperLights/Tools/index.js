const files = require.context('.', false, /\.js$/);
const tools = {};

files.keys().forEach(key => {
  if (key === './index.js' || key === 'PaperLightTool.js') return;
  tools[key.replace(/(\.\/|\.js)/g, '')] = (files(key).default);
});

export default tools;

export default class PaperLightsTheme {
  constructor (custom = {}) {
    this.$custom = custom
    this.$defaults = {
      'LED-radius': 5,
      'LED-style-fillColor': 'blue',
      'LED-style-strokeColor': 'white',
      'LED-style-strokeWidth': 1.0,
      'Light-Line-style-strokeColor': 'yellow',
      'Light-Line-style-strokeWidth': 3.0
    }
  }
  get styleForLED () {
    return this.getStyleStartsWith('LED-style-')
  }
  get styleForLightLine () {
    return this.getStyleStartsWith('Light-Line-style-')
  }
  get theme () {
    return {
      ...this.$defaults,
      ...this.$custom
    }
  }
  apply (style, toItem) {
    toItem.style = style
  }
  get (key) {
    const theme = this.theme
    if (theme.hasOwnProperty(key)) {
      return theme[key]
    }
  }
  getFilteredThemeKeys (filter) {
    const theme = this.theme
    return Object.keys(theme).filter(filter)
  }
  getFilteredTheme (filter, map = key => key) {
    const theme = this.theme
    const keys = this.getFilteredThemeKeys(filter)
    return keys.reduce((obj, key) => {
      obj[map(key)] = theme[key]
      return obj
    }, {})
  }
  getStyleStartsWith (prefix) {
    return this.getFilteredTheme(key => {
      return key.startsWith(prefix)
    }, key => {
      return key.substr(prefix.length)
    })
  }
}

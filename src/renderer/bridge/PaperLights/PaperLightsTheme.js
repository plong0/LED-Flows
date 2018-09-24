export default class PaperLightsTheme {
  constructor (custom = {}) {
    this.$custom = custom
    this.$defaults = {
      'LED-radius': 10,
      'LED-style-fillColor': 'blue',
      'LED-style-strokeColor': 'white',
      'LED-style-strokeWidth': 1.0
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

  get styleForLED () {
    return this.getFilteredTheme(key => {
      return key.startsWith('LED-style-')
    }, key => {
      return key.substr(10)
    })
  }
  get theme () {
    return {
      ...this.$defaults,
      ...this.$custom
    }
  }
}

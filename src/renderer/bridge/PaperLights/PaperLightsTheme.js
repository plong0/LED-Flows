import { Color } from 'paper'

export default class PaperLightsTheme {
  constructor (custom = {}) {
    this.$custom = custom
    this.$defaults = {
      'LED-radius': 7,
      'LED-style-fillColor': 'blue',
      'LED-style-strokeColor': 'white',
      'LED-style-strokeWidth': 1.0,
      'Lead-radius': 6,
      'Lead-style-strokeColor': 'yellow',
      'Lead-style-strokeWidth': 1.0,
      'Light-Line-style-strokeColor': 'yellow',
      'Light-Line-style-strokeColor-alpha': 0.6,
      'Light-Line-style-strokeWidth': 3.0
    }
    this.$dirty = true
    this.$theme = null
  }
  get dirty () {
    return this.$dirty
  }
  set dirty (dirty) {
    this.$dirty = dirty
  }
  get styleForLead () {
    return this.getStyleStartsWith('Lead-style-')
  }
  get styleForLED () {
    return this.getStyleStartsWith('LED-style-')
  }
  get styleForLightLine () {
    return this.getStyleStartsWith('Light-Line-style-')
  }
  get theme () {
    if (this.dirty || !this.$theme) {
      this.processDynamics([ this.$defaults, this.$custom ])
      this.$theme = {
        ...this.$defaults,
        ...this.$custom
      }
      this.dirty = false
    }
    return this.$theme
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
      if (theme.hasOwnProperty(key)) {
        obj[map(key)] = theme[key]
      }
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
  processColorAlpha (inThemes, targetKey, alpha) {
    let color
    for (let inTheme of inThemes) {
      if (inTheme && inTheme.hasOwnProperty(targetKey)) {
        if (inTheme[targetKey].constructor.name !== 'Color') {
          inTheme[targetKey] = new Color(inTheme[targetKey])
        }
        inTheme[targetKey].set({
          red: inTheme[targetKey].red,
          green: inTheme[targetKey].green,
          blue: inTheme[targetKey].blue,
          alpha
        })
        color = inTheme[targetKey]
      }
    }
    return color
  }
  processDynamics (inThemes) {
    for (let inTheme of inThemes) {
      const keys = Object.keys(inTheme)
      for (let key of keys) {
        if (key.endsWith('-alpha')) {
          const targetKey = key.substr(0, key.length - 6)
          this.processColorAlpha(inThemes, targetKey, inTheme[key])
          inTheme[key] = undefined
          delete inTheme[key]
        }
      }
    }
  }
}

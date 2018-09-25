import paper from 'paper'
import PLD from './PaperLightsData'
import PaperLightsTheme from './PaperLightsTheme'
import PaperLight from './PaperLight'

export default class PaperLights {
  constructor ({ canvas, theme = {}, lights = [] }) {
    if (canvas) {
      this.$paper = new paper.Project(canvas)
    }
    this.$PLT = new PaperLightsTheme(theme)
    this.$lights = {}
    this.lightsAdded(lights)
  }
  lightsAdded (lights) {
    for (const light of lights) {
      for (let [address, LEDs] of light.LEDs.entries()) {
        this.ledsAdded(light, address, LEDs)
      }
    }
  }
  ledsAdded (light, address, LEDs) {
    if (LEDs && LEDs.length) {
      light = this.assertLight(light)
      if (light) {
        light.ledsAdded(address, LEDs)
      }
    }
  }
  assertPaper () {
    if (this.$paper) {
      this.$paper.activate()
      return this.$paper
    }
  }
  assertLight (light) {
    if (!PLD.isLight(light)) {
      throw new TypeError('Invalid Light')
    }
    if (!this.$lights[light.id]) {
      this.$lights[light.id] = new PaperLight({
        paper: this.$paper,
        model: light,
        theme: this.theme
      })
    }
    return this.$lights[light.id]
  }
  refresh () {
    for (const light of this.lights) {
      light.refresh()
    }
  }

  get lights () {
    return this.$lights
  }
  get theme () {
    return this.$PLT
  }
}

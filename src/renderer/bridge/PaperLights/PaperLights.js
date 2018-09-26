import paper from 'paper'
import PLD from './PaperLightsData'
import PaperLightsTheme from './PaperLightsTheme'
import PaperLight from './PaperLight'
import Tools from './Tools'

export default class PaperLights {
  constructor ({ canvas, theme = {}, lights = [], actions = {}, tools = {} }) {
    if (canvas) {
      this.$paper = new paper.Project(canvas)
    }
    this.$PLT = new PaperLightsTheme(theme)
    this.$actions = {
      ...{
        addLED: this.$addLED
      },
      ...actions
    }
    this.$tools = {
      default: new Tools.Default(this),
      AddLed: new Tools.AddLed(this),
      ...tools
    }
    this.$state = {
      activeTool: null,
      activeLight: null,
      activeAddress: null
    }
    this.$lights = {}
    this.activateTool()
    this.lightsAdded(lights)
  }
  $addLED (light, address, LED) {
    // TODO: implement default handler (stand-alone model)
  }
  $addLight (location) {
    // TODO: implement default handler (stand-alone model)
  }
  activateAddress (address) {
    // TODO: activate an address
  }
  activateLight (light, address = 0) {
    // TODO: activate a light
  }
  activateTool (name = 'default') {
    if (this.$tools.hasOwnProperty(name) && this.assertPaper() && !this.$tools[name].isActive()) {
      this.$tools[name].activate()
      this.$state.activeTool = name
    }
  }
  addLED (x, y) {
    if (this.assertActiveLightAddress()) {
      this.$actions.addLED(this.activeLight, this.activeAddress, { x, y })
    }
  }
  addLight (x, y) {
    this.$actions.addLight({ x, y })
  }
  assertActiveLight () {
    // make sure a light is active
    if (!this.activeLight) {
      // TODO: create a new light
      return true
    }
    return this.activeLight
  }
  assertActiveLightAddress () {
    // make sure a light and address are active
    if (this.assertActiveLight()) {
      if (!this.activeAddress) {
        // TODO: create a new light address
        return true
      }
    }
    return (this.activeLight && this.activeAddress)
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
  refresh () {
    for (const light of this.lights) {
      light.refresh()
    }
  }
  selectPaperLED () {
    // TODO: select by paperLED item (ie. paper item clicked)
  }
  selectPaperLight () {
    // TODO: select by paperLight item (if PaperLight renders any...)
  }
  get activeAddress () {
    return this.$state.activeAddress
  }
  get activeLight () {
    return this.$state.activeLight
  }
  get activeTool () {
    return this.$state.activeTool
  }
  get lights () {
    return this.$lights
  }
  get theme () {
    return this.$PLT
  }
}

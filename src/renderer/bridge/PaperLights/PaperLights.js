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
    this.$scaling = { x: 1.0, y: 1.0 }
    this.$PLT = new PaperLightsTheme(theme)
    this.$actions = {
      ...{
        addLED: this.$addLED,
        addLight: this.$addLight
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
    this.onLightsAdded(lights)
  }
  $addLED (light, address, LED) {
    // TODO: implement default handler (stand-alone model)
  }
  $addLight () {
    // TODO: implement default handler (stand-alone model)
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
  activateAddress (address = null) {
  }
  activateLight (light = null, address = null) {
    if (this.$state.activeLight && (!light || this.$state.activeLight.id !== light.id)) {
      this.activateTool()
    }
    this.$state.activeLight = light
    this.$state.activeAddress = address
  }
  activateTool (name = 'default') {
    if (this.$tools.hasOwnProperty(name) && this.assertPaper() && !this.$tools[name].isActive()) {
      this.$tools[name].activate()
      this.$state.activeTool = name
    }
  }
  addLED (x, y) {
    // it is ok if activeLight and activeAddress are not set here
    // it only matters that the $action does the right thing with them undefined
    return this.$actions.addLED(this.activeLight, this.activeAddress, { x, y })
  }
  addLight () {
    return this.$actions.addLight()
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
  assertPaper () {
    if (this.$paper) {
      this.$paper.activate()
      return this.$paper
    }
  }
  normalizePoint (point) {
    if (this.$paper && this.$paper.view) {
      const scaledPoint = {
        x: (point.x / this.$scaling.x),
        y: (point.y / this.$scaling.y)
      }
      return scaledPoint
    }
    return point
  }
  onLedsAdded (light, address, LEDs) {
    if (LEDs && LEDs.length) {
      light = this.assertLight(light)
      if (light) {
        light.onLedsAdded(address, LEDs)
      }
    }
  }
  onLightsAdded (lights) {
    for (const light of lights) {
      for (let [address, LEDs] of light.LEDs.entries()) {
        this.ledsAdded(light, address, LEDs)
      }
    }
  }
  refresh () {
    for (const light of this.lights) {
      light.refresh()
    }
  }
  resizeCanvas (width, height) {
    if (this.$paper && this.$paper.view) {
      this.$paper.view.element.style.width = width + 'px'
      this.$paper.view.element.style.height = height + 'px'
      this.$scaling.x = (width / this.$paper.view.viewSize.width)
      this.$scaling.y = (height / this.$paper.view.viewSize.height)
    }
  }
  selectPaperLED () {
    // TODO: select by paperLED item (ie. paper item clicked)
  }
  selectPaperLight () {
    // TODO: select by paperLight item (if PaperLight renders any...)
  }
}

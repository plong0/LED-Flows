import paper from 'paper'
import PLD from './PaperLightsData'
import PaperLightsTheme from './PaperLightsTheme'
import PaperLight from './PaperLight'
import Tools from './Tools'

export default class PaperLights {
  constructor ({ canvas, theme = {}, lights = [], actions = {}, tools = {} }) {
    if (canvas) {
      this.$paper = new paper.Project(canvas)
      this.$paper.options.hitTolerance = 10
    }
    this.$scaling = { x: 1.0, y: 1.0 }
    this.$PLT = new PaperLightsTheme(theme)
    this.$actions = {
      ...{
        activateLight: this.$activateLight,
        addLead: this.$addLead,
        addLED: this.$addLED,
        addLight: this.$addLight,
        deleteLead: this.$deleteLead,
        deleteLED: this.$deleteLED,
        moveLead: this.$moveLead,
        moveLED: this.$moveLED
      },
      ...actions
    }
    this.$tools = {
      default: new Tools.Default(this),
      AddLed: new Tools.AddLed(this),
      ...tools
    }
    this.$state = {
      activeAddress: null,
      activeLayer: null,
      activeLight: null,
      activeTool: null
    }
    this.$layers = {}
    this.$lights = {}
    this.addLayers(['default', 'LightLines', 'LEDs'])
    this.activateLayer()
    this.activateTool()
    this.onLightsAdded(lights)
  }
  $activateLight (light = null, address = null) {
    // TODO: implement default handler (stand-alone model)
  }
  $addLED (light, address, LED) {
    // TODO: implement default handler (stand-alone model)
  }
  $addLead (light, address, index, lead) {
    // TODO: implement default handler (stand-alone model)
  }
  $addLight () {
    // TODO: implement default handler (stand-alone model)
  }
  $deleteLead (light, address, index) {
    // TODO: implement default handler (stand-alone model)
  }
  $deleteLED (light, address, index) {
    // TODO: implement default handler (stand-alone model)
  }
  $moveLead (light, address, index, delta) {
    // TODO: implement default handler (stand-alone model)
  }
  $moveLED (light, address, index, delta) {
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
  get viewHeight () {
    return this.$paper.view.viewSize.height
  }
  get viewWidth () {
    return this.$paper.view.viewSize.width
  }
  activateAddress (address = null) {
    this.$state.activeAddress = address
  }
  activateLayer (name = 'default') {
    if (this.$layers.hasOwnProperty(name) && this.assertPaper()) {
      this.$layers[name].activate()
      this.$state.activeLayer = name
    }
  }
  activateLight (light = null, address = null) {
    this.$actions.activateLight(light, address)
  }
  activateTool (name = 'default') {
    if (this.$tools.hasOwnProperty(name) && !this.$tools[name].isActive() && this.assertPaper()) {
      this.$tools[name].activate()
      this.$state.activeTool = name
    }
  }
  addLayer (name, index = undefined) {
    // undefined index appends (behaviour of paper.Project.insertLayer)
    if (name && !this.$layers.hasOwnProperty(name) && this.assertPaper()) {
      const layer = new paper.Layer({ name })
      if (this.$paper.insertLayer(index, layer) !== null) {
        this.$layers[name] = layer
      } else {
        layer.remove()
      }
      this.activateLayer(this.$state.activeLayer || undefined)
    }
  }
  addLayers (names, index = undefined) {
    let indexOffset = 0
    for (const name of names) {
      this.addLayer(name, ((index || index === 0) ? (index + indexOffset++) : undefined))
    }
  }
  addLED (point, address = null, light = null) {
    // it is ok if activeLight and activeAddress are not set here
    // it only matters that the $action does the right thing with them undefined
    return this.$actions.addLED(
      (light !== null ? light : this.activeLight),
      (address !== null ? address : this.activeAddress),
      { x: point.x, y: point.y }
    )
  }
  addLead (point, address = null, index = null, light = null) {
    // it is ok if activeLight and activeAddress are not set here
    // it only matters that the $action does the right thing with them undefined
    return this.$actions.addLead(
      (light !== null ? light : this.activeLight),
      (address !== null ? address : this.activeAddress),
      index,
      { x: point.x, y: point.y }
    )
  }
  addLight () {
    return this.$actions.addLight()
  }
  assertLight (light) {
    if (!PLD.isLight(light)) {
      throw new TypeError('Invalid Light')
    }
    if (!this.$lights[light.id]) {
      this.$lights[light.id] = new PaperLight(this, {
        model: light
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
  deleteLead (light, address, index) {
    return this.$actions.deleteLead(
      (light !== null ? light : this.activeLight),
      (address !== null ? address : this.activeAddress),
      index
    )
  }
  deleteLED (light, address, index) {
    return this.$actions.deleteLED(
      (light !== null ? light : this.activeLight),
      (address !== null ? address : this.activeAddress),
      index
    )
  }
  getLayer (name = null) {
    if (name === null) {
      name = this.$state.activeLayer
    }
    if (name && this.$layers.hasOwnProperty(name)) {
      return this.$layers[name]
    }
  }
  hitTestAtPoint (point) {
    if (this.assertPaper) {
      return this.$paper.hitTest(point)
    }
  }
  moveLead (delta, light, address, index) {
    return this.$actions.moveLead(
      (light !== null ? light : this.activeLight),
      (address !== null ? address : this.activeAddress),
      index,
      { x: delta.x, y: delta.y }
    )
  }
  moveLED (delta, light, address, index) {
    return this.$actions.moveLED(
      (light !== null ? light : this.activeLight),
      (address !== null ? address : this.activeAddress),
      index,
      { x: delta.x, y: delta.y }
    )
  }
  normalizePoint (point) {
    if (this.$paper && this.$paper.view) {
      return {
        x: (point.x / this.$scaling.x),
        y: (point.y / this.$scaling.y)
      }
    }
    return point
  }
  onLightActivated (light = null, address = null) {
    if (this.$state.activeLight && (!light || this.$state.activeLight.id !== light.id)) {
      this.activateTool()
    }
    this.$state.activeLight = light
    this.$state.activeAddress = address
  }
  onLeadsAdded (light, address, index, leads) {
    if (leads && leads.length) {
      light = this.assertLight(light)
      if (light) {
        light.onLeadsAdded(address, index, leads)
      }
    }
  }
  onLedsAdded (light, address, LEDs) {
    if (LEDs && LEDs.length) {
      light = this.assertLight(light)
      if (light) {
        light.onLedsAdded(address, LEDs)
      }
    }
  }
  onLeadDeleted (light, address, index) {
    light = this.assertLight(light)
    if (light) {
      light.onLeadDeleted(address, index)
    }
  }
  onLedDeleted (light, address, index) {
    light = this.assertLight(light)
    if (light) {
      light.onLedDeleted(address, index)
    }
  }
  onLeadMoved (light, address, index, position) {
    light = this.assertLight(light)
    if (light) {
      light.onLeadMoved(address, index, position)
    }
  }
  onLedMoved (light, address, index, position) {
    light = this.assertLight(light)
    if (light) {
      light.onLedMoved(address, index, position)
    }
  }
  onLightsAdded (lights) {
    for (const light of lights) {
      // uses .entries() to get iterator with key and value
      for (let [address, entry] of light.LEDs.entries()) {
        this.onLedsAdded(light, address, entry.LEDs)
        this.onLeadsAdded(light, address, 0, entry.leads)
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

import { Tool } from 'paper'

export default class PaperLightTool extends Tool {
  constructor (paperLights) {
    super()
    this.$PL = paperLights
    this.active = false
    this.baseEvents = {
      onMouseUp: (event) => {
        if (event.event.button === 2) {
          this.deactivate()
        }
      },
      onKeyUp: (event) => {
        if (event.key === 'escape') {
          this.deactivate()
        }
      },
      onActivate: (event) => {
        this.active = true
      },
      onDeactivate: (event) => {
        this.active = false
      }
    }
    this.validEventTypes = [
      'onActivate',
      'onDeactivate',
      'onMouseDown',
      'onMouseDrag',
      'onMouseMove',
      'onMouseUp',
      'onKeyDown',
      'onKeyUp'
    ]
    this.bindEvents(this.baseEvents)
  }
  bindEvents (handlers) {
    for (let eventType in handlers) {
      const handler = handlers[eventType]
      if (this.validEventTypes.includes(eventType) && typeof handler === 'function') {
        this[eventType] = handler
      }
    }
  }
  deactivate () {
    if (this.$PL) {
      this.$PL.activateTool()
    }
  }
  isActive () {
    return this.active
  }
}

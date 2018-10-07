import PaperLightTool from './PaperLightTool'

export default class Default extends PaperLightTool {
  constructor (paperLights) {
    super(paperLights)
    this.$doubleClickTime = 300
    this.$state = {
      activeLED: null,
      lastTime: {
        mouseDown: null,
        mouseDrag: null,
        mouseMove: null,
        mouseUp: null
      }
    }
    this.isStale = (type, compare) => {
      const times = this.$state.lastTime
      if (times[type] === null) {
        return true
      }
      for (let check of compare) {
        if (times[check] !== null && times[check] > times[type]) {
          return true
        }
      }
      return false
    }
    const events = {
      onMouseDown: (event) => {
        const hit = this.$PL.hitTestAtPoint(this.$PL.normalizePoint(event.downPoint))
        // console.log(`[Default Tool] onMouseDown ->`, event, hit)
        this.$state.activeLED = null
        if (hit && hit.item) {
          if (hit.item.data && hit.item.data.light) {
            this.$PL.activateLight(hit.item.data.light)
          }
          if (hit.item.data && hit.item.data.LED) {
            this.$state.activeLED = hit.item
          }
        } else {
          this.$PL.activateLight()
        }
        this.$state.lastTime.mouseDown = event.timeStamp
      },
      onMouseDrag: (event) => {
        if (this.$state.activeLED) {
          const delta = this.$PL.normalizePoint(event.delta)
          const LED = this.$state.activeLED.data
          this.$PL.moveLED(delta, LED.light, LED.address.id, LED.LEDindex)
        }
        this.$state.lastTime.mouseDrag = event.timeStamp
      },
      onMouseMove: (event) => {
        this.$state.lastTime.mouseMove = event.timeStamp
      },
      onMouseUp: (event) => {
        if ((event.timeStamp - this.$state.lastTime.mouseUp) < this.$doubleClickTime && !this.isStale('mouseUp', ['mouseDrag', 'mouseMove'])) {
          // double click
          if (this.$state.activeLED) {
            const LED = this.$state.activeLED.data
            this.$PL.deleteLED(LED.light, LED.address.id, LED.LEDindex)
          }
        } else if (!this.isStale('mouseDown', ['mouseDrag', 'mouseMove'])) {
          // single click
          if (this.$state.activeLED) {
            const LED = this.$state.activeLED.data
            if (LED.address.id === (LED.light.LEDs.length - 1)) {
              this.$PL.activateTool('AddLed')
            } else if (LED.address.id === 0) {
              this.$PL.activateTool('AddLed', { toStart: true })
            }
          }
        }
        if (this.$state.activeLED) {
          this.$state.activeLED = null
        }
        this.$state.lastTime.mouseUp = event.timeStamp
      }
    }
    this.bindEvents(events)
  }
}

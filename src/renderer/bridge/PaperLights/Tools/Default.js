import PaperLightTool from './PaperLightTool'

export default class Default extends PaperLightTool {
  constructor (paperLights) {
    super(paperLights)
    this.$doubleClickTime = 300
    this.$state = {
      activeLED: null,
      shiftCloned: false,
      singleClickTimer: null,
      lastPoint: {
        mouseMove: null
      },
      lastTime: {
        mouseDown: null,
        mouseDrag: null,
        mouseMove: null,
        mouseUp: null
      }
    }
    this.clearSingleClickTimer = (forceRun = false) => {
      if (this.$state.singleClickTimer) {
        clearTimeout(this.$state.singleClickTimer)
        this.$state.singleClickTimer = null
        if (forceRun) {
          this.handleSingleClick()
        }
      }
    }
    this.clearState = () => {
      this.$state.activeLED = null
      this.$state.shiftCloned = false
    }
    this.handleSingleClick = () => {
      if (!this.$state.activeLED) {
        return
      }
      const LED = this.$state.activeLED.data
      let params = {
        targetPoint: this.$state.lastPoint.mouseMove
      }
      if (LED.address.id === 0) {
        params.toStart = true
      }
      if (LED.address.id === (LED.light.LEDs.length - 1)) {
        this.$PL.activateTool('AddLed', params)
      } else if (LED.address.id === 0) {
        this.$PL.activateTool('AddLed', params)
      }
      this.clearSingleClickTimer()
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
      onDeactivate: () => {
        this.baseEvents.onDeactivate()
        this.clearSingleClickTimer()
        this.clearState()
      },
      onMouseDown: (event) => {
        const hit = this.$PL.hitTestAtPoint(this.$PL.normalizePoint(event.downPoint))
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
          const LED = this.$state.activeLED.data
          if (this.pressedKeys.includes('shift') && !this.$state.shiftCloned) {
            const point = this.$PL.normalizePoint(event.point)
            this.$PL.addLED(point, LED.address.id, LED.light, true).then(() => {
              this.$state.activeLED = LED.address.LEDs[LED.address.LEDs.length - 1]
            })
            this.$state.activeLED = null
            this.$state.shiftCloned = true
          } else {
            const delta = this.$PL.normalizePoint(event.delta)
            this.$PL.moveLED(delta, LED.light, LED.address.id, LED.LEDindex)
          }
        }
        this.$state.lastTime.mouseDrag = event.timeStamp
      },
      onMouseMove: (event) => {
        this.$state.lastTime.mouseMove = event.timeStamp
        this.$state.lastPoint.mouseMove = this.$PL.normalizePoint(event.point)
        this.clearSingleClickTimer(true)
      },
      onMouseUp: (event) => {
        if ((event.timeStamp - this.$state.lastTime.mouseUp) <= this.$doubleClickTime && !this.isStale('mouseUp', ['mouseDrag', 'mouseMove'])) {
          // double click
          this.clearSingleClickTimer()
          if (this.$state.activeLED) {
            const LED = this.$state.activeLED.data
            this.$PL.deleteLED(LED.light, LED.address.id, LED.LEDindex)
          }
        } else if (!this.isStale('mouseDown', ['mouseDrag', 'mouseMove']) && this.$state.activeLED) {
          // single click, run after a short delay to allow double-click opportunity
          this.clearSingleClickTimer()
          this.$state.singleClickTimer = setTimeout(this.handleSingleClick, this.$doubleClickTime + 1)
        } else if (this.$state.activeLED) {
          this.$state.activeLED = null
        }
        this.$state.shiftCloned = false
        this.$state.lastTime.mouseUp = event.timeStamp
      }
    }
    this.bindEvents(events)
  }
}

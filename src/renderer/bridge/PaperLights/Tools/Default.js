import PaperLightTool from './PaperLightTool'

export default class Default extends PaperLightTool {
  constructor (paperLights) {
    super(paperLights)
    this.$doubleClickTime = 300
    this.$state = {
      activeLED: null,
      hoverLine: null,
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
      },
      tempLED: null
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
      this.$state.hoverLine = null
      this.$state.shiftCloned = false
      this.clearTempLED()
    }
    this.clearTempLED = () => {
      if (this.$state.tempLED) {
        this.$PL.deleteLED(this.$state.tempLED.light, this.$state.tempLED.address, 0)
        this.$state.tempLED = null
      }
    }
    this.createTempLED = () => {
      if (this.$state.hoverLine && !this.$state.tempLED) {
        this.$state.tempLED = {
          light: this.$state.hoverLine.light,
          address: this.$state.hoverLine.segmentIndex + 1
        }
        this.$PL.addLED(this.$state.lastPoint.mouseMove, this.$state.tempLED.address, this.$state.tempLED.light)
      }
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
    this.refreshTempLED = () => {
      if (this.$state.hoverLine && this.pressedKeys.includes('shift')) {
        if (!this.$state.tempLED) {
          this.createTempLED()
        } else if (this.$state.tempLED.light.id !== this.$state.hoverLine.light.id || this.$state.tempLED.address !== this.$state.hoverLine.segmentIndex + 1) {
          this.clearTempLED()
          this.createTempLED()
        }
      } else if (!this.$state.hoverLine || !this.pressedKeys.includes('shift')) {
        if (this.$state.tempLED) {
          this.clearTempLED()
        }
      }
    }
    const events = {
      onDeactivate: () => {
        this.baseEvents.onDeactivate()
        this.clearSingleClickTimer()
        this.clearState()
      },
      onKeyDown: (event) => {
        if (this.baseEvents.onKeyDown(event)) {
          return true
        }
        if (event.key === 'shift') {
          this.refreshTempLED()
        }
      },
      onKeyUp: (event) => {
        if (this.baseEvents.onKeyUp(event)) {
          return true
        }
        if (event.key === 'shift') {
          this.clearTempLED()
        }
      },
      onMouseDown: (event) => {
        if (this.$state.tempLED) {
          // leave the LED in place and forget about it
          this.$state.tempLED = null
          // also prevent a duplicate being created on mouse drag
          this.$state.shiftCloned = true
        }
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
        const hit = this.$PL.hitTestAtPoint(this.$PL.normalizePoint(event.point))
        let hoverLine = null
        if (hit && hit.item) {
          if (hit.item.data && hit.item.data.light) {
            if (hit.location) {
              let segmentIndex = hit.location.index
              if (hit.location.path.data && hit.location.path.data.hasOwnProperty('segmentIndex')) {
                // segmentIndex could be explicitly set (ie. multi-point connection lines)
                segmentIndex = parseInt(hit.location.path.data['segmentIndex'])
              }
              let paperLight = this.$PL.assertLight(hit.item.data.light, false)
              if (paperLight && paperLight.$paperLine) {
                hoverLine = {
                  light: hit.item.data.light,
                  segmentIndex: paperLight.$paperLine.getSegmentPointIndex(segmentIndex)
                }
              }
            }
          }
          if (hit.item.data && hit.item.data.LED) {
            // LED hovered
          }
        }
        if (hoverLine) {
          this.$state.hoverLine = hoverLine
        } else if (this.$state.hoverLine) {
          this.$state.hoverLine = null
        }
        if (this.$state.hoverLine && this.pressedKeys.includes('shift')) {
          this.refreshTempLED()
        } else if (this.$state.tempLED) {
          this.clearTempLED()
        }
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

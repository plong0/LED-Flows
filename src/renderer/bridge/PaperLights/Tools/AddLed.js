import PaperLightTool from './PaperLightTool'
import { Group, Path, Shape } from 'paper'

export default class AddLed extends PaperLightTool {
  constructor (paperLights) {
    super(paperLights)
    this.$UI = {
      targetPoint: null,
      temp: {
        lines: null,
        LEDs: null
      }
    }
    this.clearUI = () => {
      if (this.$UI.temp.lines) {
        this.$UI.temp.lines.removeChildren()
      }
      if (this.$UI.temp.LEDs) {
        this.$UI.temp.LEDs.removeChildren()
      }
    }
    this.refreshUI = () => {
      const point = this.$UI.targetPoint
      if (!point) {
        return
      }
      const light = this.$PL.activePaperLight
      const lastPoint = (light ? light.getLinePoint(this.params.toStart ? 0 : null) : null)
      const lastPoints = ((lastPoint && lastPoint.points) ? lastPoint.points : [])
      if (!this.$UI.temp.LEDs.children.length) {
        const newLED = new Shape.Circle({
          insert: false,
          center: point,
          radius: this.$PL.theme.get('LED-radius')
        })
        newLED.style = this.$PL.theme.styleForLED
        this.$UI.temp.LEDs.addChild(newLED)
      } else {
        this.$UI.temp.LEDs.children[0].set({ position: point })
      }
      if (lastPoints.length) {
        if (this.$UI.temp.lines.children.length > lastPoints.length) {
          this.$UI.temp.lines.removeChildren(lastPoints.length)
        }
        for (let i = 0; i < lastPoints.length; i++) {
          if (i >= this.$UI.temp.lines.children.length) {
            let newLine = new Path.Line({
              insert: false,
              from: lastPoints[i],
              to: point
            })
            newLine.style = this.$PL.theme.styleForLightLine
            this.$UI.temp.lines.addChild(newLine)
          } else {
            const tempLine = this.$UI.temp.lines.children[i]
            tempLine.segments[0].point.set(lastPoints[i])
            tempLine.segments[1].point.set(point)
          }
        }
      }
    }
    const events = {
      onActivate: () => {
        this.baseEvents.onActivate()
        if (!this.$UI.temp.lines) {
          this.$UI.temp.lines = new Group()
        }
        if (!this.$UI.temp.LEDs) {
          this.$UI.temp.LEDs = new Group()
          this.$UI.temp.LEDs.style = this.$PL.theme.styleForLED
        }
        const layer = this.$PL.getLayer('LEDs-Active')
        if (layer) {
          layer.addChild(this.$UI.temp.lines)
          layer.addChild(this.$UI.temp.LEDs)
        }
        if (this.params.targetPoint) {
          this.$UI.targetPoint = this.params.targetPoint
          this.params.targetPoint = undefined
          delete this.params.targetPoint
          this.refreshUI()
        }
      },
      onDeactivate: () => {
        this.baseEvents.onDeactivate()
        this.$UI.targetPoint = null
        // remove and destroy the temp line and LED/lead
        if (this.$UI.temp.lines) {
          this.$UI.temp.lines.remove()
          this.$UI.temp.lines = null
        }
        if (this.$UI.temp.LEDs) {
          this.$UI.temp.LEDs.remove()
          this.$UI.temp.LEDs = null
        }
      },
      onMouseMove: (event) => {
        this.$UI.targetPoint = this.$PL.normalizePoint(event.point)
        this.refreshUI()
      },
      onMouseUp: (event) => {
        if (event.event.button === 2) {
          this.baseEvents.onMouseUp(event)
          return
        }
        const point = this.$PL.normalizePoint(event.point)
        this.$PL.addLED(point, (this.params.toStart ? 0 : null))
        this.clearUI()
      }
    }
    this.bindEvents(events)
  }
}

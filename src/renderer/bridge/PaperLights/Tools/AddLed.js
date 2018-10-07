import PaperLightTool from './PaperLightTool'

export default class AddLed extends PaperLightTool {
  constructor (paperLights) {
    super(paperLights)
    const events = {
      onMouseUp: (event) => {
        if (event.event.button === 2) {
          this.baseEvents.onMouseUp(event)
          return
        }
        const point = this.$PL.normalizePoint(event.point)
        this.$PL.addLED(point, (this.params.toStart ? 0 : null))
      }
    }
    this.bindEvents(events)
  }
}

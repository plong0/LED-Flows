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
        this.$PL.addLED(event.point.x, event.point.y)
      }
    }
    this.bindEvents(events)
  }
}

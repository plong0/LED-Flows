import PaperLightTool from './PaperLightTool'

export default class Default extends PaperLightTool {
  constructor (paperLights) {
    super(paperLights)
    this.$state = {
      activeLED: null
    }
    const events = {
      onMouseDown: (event) => {
        const hit = this.$PL.hitTestAtPoint(this.$PL.normalizePoint(event.downPoint))
        // console.log(`[Default Tool] onMouseDown ->`, event, hit)
        if (hit && hit.item) {
          if (hit.item.data && hit.item.data.LED) {
            this.$state.activeLED = hit.item
          }
        }
      },
      onMouseUp: () => {
        if (this.$state.activeLED) {
          this.$state.activeLED = null
        }
      },
      onMouseDrag: (event) => {
        if (this.$state.activeLED) {
          const delta = this.$PL.normalizePoint(event.delta)
          const LED = this.$state.activeLED.data
          this.$PL.moveLED(delta, LED.light, LED.address.id, LED.LEDindex)
        }
      }
    }
    this.bindEvents(events)
  }
}

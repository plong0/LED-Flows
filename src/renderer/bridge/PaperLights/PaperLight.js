import paper from 'paper'
import PLD from './PaperLightsData'

export default class PaperLight {
  constructor (paperLights, { model }) {
    this.$PL = paperLights
    this.$model = model
    this.$paperLEDs = []
  }
  get id () {
    return this.$model.id
  }
  get LEDs () {
    return this.$model.LEDs
  }
  get theme () {
    return this.$PL.theme
  }
  generatePaperLED (LED, address) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    if (this.$PL.assertPaper()) {
      let paperLED = new paper.Shape.Circle(this.normalizePoint(LED), this.theme.get('LED-radius'))
      paperLED.data.light = this
      this.theme.apply(this.theme.styleForLED, paperLED)
      this.$paperLEDs.push(paperLED)
      return this.refreshPaperLED(paperLED, LED, address)
    }
  }
  normalizePoint (point, toLocal = false) {
    // TODO: normalize a point
    return {
      x: point.x,
      y: point.y
    }
  }
  onLedsAdded (address, LEDs) {
    for (const LED of LEDs) {
      try {
        this.generatePaperLED(LED, address)
      } catch (error) {
        // Bad LED
      }
    }
  }
  refresh () {
    let index = 0
    for (const address of this.LEDs) {
      for (const LED of address) {
        try {
          if (index >= this.$paperLEDs.length) {
            if (this.generatePaperLED(LED, address)) {
              index++
            }
          } else {
            this.refreshPaperLED(this.$paperLEDs[index], LED, address)
            index++
          }
        } catch (error) {
          // Bad LED
        }
      }
    }
  }
  refreshPaperLED (paperLED, LED, address) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    paperLED.set(this.normalizePoint(LED))
    paperLED.data.address = address
    return paperLED
  }
}

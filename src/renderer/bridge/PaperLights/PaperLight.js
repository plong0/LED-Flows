import paper from 'paper'
import PLD from './PaperLightsData'

export default class PaperLight {
  constructor ({ paper, model, theme }) {
    this.$paper = paper
    this.$model = model
    this.$PLT = theme
    this.$paperLEDs = []
  }
  assertPaper () {
    if (this.$paper) {
      this.$paper.activate()
      return this.$paper
    }
  }
  ledsAdded (address, LEDs) {
    this.refresh()
  }
  generatePaperLED (LED, address) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    if (this.assertPaper()) {
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
  refreshPaperLED (paperLED, LED, address) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    paperLED.set(this.normalizePoint(LED))
    paperLED.data.address = address
    return paperLED
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
  get id () {
    return this.$model.id
  }
  get LEDs () {
    return this.$model.LEDs
  }
  get theme () {
    return this.$PLT
  }
}

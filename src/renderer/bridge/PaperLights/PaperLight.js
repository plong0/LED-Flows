import paper from 'paper'
import PLD from './PaperLightsData'

export default class PaperLight {
  constructor ({ paper, model, theme }) {
    this.$paper = paper
    this.$model = model
    this.$PLT = theme
    this.$paperLEDs = []
  }
  ledsAdded (address, LEDs) {
    this.refresh()
  }
  generatePaperLED (LED) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    let paperLED = new paper.Shape.Circle({x: LED.x, y: LED.y}, this.theme.get('LED-radius'))
    this.theme.apply(this.theme.styleForLED, paperLED)
    return paperLED
  }
  refreshPaperLED (paperLED, LED) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    paperLED.set({ x: LED.x, y: LED.y })
    return paperLED
  }
  refresh () {
    let index = 0
    for (const address of this.LEDs) {
      for (const LED of address) {
        try {
          if (index >= this.$paperLEDs.length) {
            const newLED = this.generatePaperLED(LED)
            if (newLED) {
              this.$paperLEDs.push(newLED)
              index++
            }
          } else {
            this.refreshPaperLED(this.$paperLEDs[index], LED)
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

import paper from 'paper'
import PLD from './PaperLightsData'

export default class PaperLight {
  constructor (paperLights, { model }) {
    this.$PL = paperLights
    this.$model = model
    this.$paperGroupLEDs = null
    this.$paperLEDs = {}
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
  assertPaperAddress (address) {
    if (!this.$paperLEDs.hasOwnProperty(address)) {
      if (this.assertPaperGroupLEDs()) {
        this.$paperLEDs[address] = {
          id: address,
          group: new paper.Group({ name: `light-leds-address-${this.id}-${address}` }),
          LEDs: []
        }
        this.$paperGroupLEDs.addChild(this.$paperLEDs[address].group)
      }
    }
    return this.$paperLEDs[address]
  }
  assertPaperGroupLEDs () {
    if (!this.$paperGroupLEDs) {
      this.$paperGroupLEDs = new paper.Group({ name: `light-leds-${this.id}` })
      const layer = this.$PL.getLayer('LEDs')
      if (layer) {
        layer.addChild(this.$paperGroupLEDs)
      }
    }
    return this.$paperGroupLEDs
  }
  generatePaperLED (LED, address) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    if (this.$PL.assertPaper()) {
      const paperAddress = this.assertPaperAddress(address)
      if (paperAddress) {
        let paperLED = new paper.Shape.Circle(this.normalizePoint(LED), this.theme.get('LED-radius'))
        paperAddress.group.addChild(paperLED)
        paperAddress.LEDs.push(paperLED)
        paperLED.data.address = paperAddress
        paperLED.data.light = this
        this.theme.apply(this.theme.styleForLED, paperLED)
        return this.refreshPaperLED(paperLED, LED, address)
      }
    }
  }
  normalizePoint (point, toLocal = false) {
    // TODO: normalize a point
    return {
      x: point.x,
      y: point.y
    }
  }
  onLeadsAdded (address, index, leads) {
    for (const lead of leads) {
      try {
        console.log(`NEW LEAD ON [${address}] @ [${index}] =>`, lead)
      } catch (error) {
        // Bad LED
      }
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
    // TODO: refresh the PaperLEDs
  }
  refreshPaperLED (paperLED, LED, address) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    paperLED.set(this.normalizePoint(LED))
    const paperAddress = this.assertPaperAddress(address)
    if (paperAddress && (!paperLED.data.address || paperLED.data.address.id !== paperAddress.id)) {
      if (paperLED.data.address) {
        const oldAddress = paperLED.data.address
        const oldAddressIndex = oldAddress.LEDs.indexOf(paperLED)
        if (oldAddressIndex !== -1) {
          oldAddress.LEDs.splice(oldAddressIndex, 1)
        }
      }
      paperAddress.group.addChild(paperLED)
      paperAddress.LEDs.push(paperLED)
      paperLED.data.address = paperAddress
    }
    return paperLED
  }
}

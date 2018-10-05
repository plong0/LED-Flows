import paper from 'paper'
import PLD from './PaperLightsData'
import MultiLine from './Shapes/MultiLine'

export default class PaperLight {
  constructor (paperLights, { model }) {
    this.$PL = paperLights
    this.$model = model
    this.$paperGroupLEDs = null
    this.$paperLEDs = {}
    this.$paperLine = null
  }
  get id () {
    return this.$model.id
  }
  get leads () {
    return this.$model.leads
  }
  get LEDs () {
    return this.$model.LEDs
  }
  get light () {
    return this.$model
  }
  get paperAddresses () {
    return Object.keys(this.$paperLEDs).sort((a, b) => (a - b))
  }
  get theme () {
    return this.$PL.theme
  }
  addPaperLinePoint (address, item, stack = true) {
    if (item && item.data) {
      const paperAddress = this.assertPaperAddress(address)
      if (paperAddress) {
        let index = null
        if (item.data.hasOwnProperty('LED')) {
          // use index = null to retrieve index for LEDs at address
        } else if (item.data.hasOwnProperty('leadIndex')) {
          index = item.data.leadIndex
        }
        let linePointIndex = this.getLinePointIndex(address, index)
        if (!this.$paperLine) {
          this.$paperLine = new MultiLine()
          this.$paperLine.setData({
            light: this.light
          })
          this.$paperLine.setStyle(this.theme.styleForLightLine)
        }
        this.$paperLine.addMultiPoint({
          x: item.x,
          y: item.y,
          data: item.data
        }, linePointIndex, stack)
      }
    }
  }
  assertPaperAddress (address, create = true) {
    if (!this.$paperLEDs.hasOwnProperty(address) && create) {
      if (this.assertPaperGroupLEDs()) {
        this.$paperLEDs[address] = {
          id: address,
          group: new paper.Group({ name: `light-leds-address-${this.id}-${address}` }),
          leads: [],
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
  generatePaperLead (lead, address, index) {
    if (!PLD.isLead(lead)) {
      throw new TypeError('Invalid Lead')
    }
    if (this.$PL.assertPaper()) {
      const paperAddress = this.assertPaperAddress(address)
      if (paperAddress) {
        const paperLead = new paper.Point(lead.x, lead.y)
        if (!paperLead.data) {
          paperLead.data = {}
        }
        paperLead.data.light = this
        paperLead.data.address = paperAddress
        paperLead.data.lead = lead
        paperLead.data.leadIndex = index
        return this.refreshPaperLead(paperLead, lead, address, index)
      }
    }
  }
  generatePaperLED (LED, address, index) {
    if (!PLD.isLED(LED)) {
      throw new TypeError('Invalid LED')
    }
    if (this.$PL.assertPaper()) {
      const paperAddress = this.assertPaperAddress(address)
      if (paperAddress) {
        let paperLED = new paper.Shape.Circle(this.normalizePoint(LED), this.theme.get('LED-radius'))
        paperAddress.group.addChild(paperLED)
        paperAddress.LEDs.push(paperLED)
        paperLED.data.light = this
        paperLED.data.address = paperAddress
        paperLED.data.LED = LED
        paperLED.data.LEDindex = index
        this.theme.apply(this.theme.styleForLED, paperLED)
        return this.refreshPaperLED(paperLED, LED, address, index)
      }
    }
  }
  getLinePointIndex (address = null, index = null) {
    // index === -1
    // index === null gets index for LEDs
    const addresses = this.paperAddresses
    let pointIndex = 0
    for (let key of addresses) {
      const paperAddress = this.$paperLEDs[key]
      if (parseInt(key) === address) {
        if (index === null) {
          pointIndex += paperAddress.leads.length
        } else if (paperAddress.leads.length) {
          pointIndex += (paperAddress.leads.length - 1 - index)
        }
        // address is found and pointIndex offset apppropriately
        break
      } else {
        pointIndex += paperAddress.leads.length + (paperAddress.LEDs.length ? 1 : 0) // (+ 1 for LEDs because they always group)
      }
    }
    return pointIndex
  }
  getPaperLED (address, index) {
    if (this.$PL.assertPaper()) {
      const paperAddress = this.assertPaperAddress(address, false)
      if (paperAddress && index >= 0 && index < paperAddress.LEDs.length) {
        return paperAddress.LEDs[index]
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
    let offset = 0
    for (const lead of leads) {
      try {
        const paperLead = this.generatePaperLead(lead, address, index + offset++)
        if (paperLead) {
          this.addPaperLinePoint(address, paperLead, false)
        }
      } catch (error) {
        // Bad lead
      }
    }
  }
  onLedsAdded (address, LEDs) {
    const index = this.light.LEDs[address].LEDs.length - LEDs.length
    let offset = 0
    for (const LED of LEDs) {
      try {
        const paperLED = this.generatePaperLED(LED, address, index + offset++)
        if (paperLED) {
          this.addPaperLinePoint(address, paperLED)
        }
      } catch (error) {
        // Bad LED
      }
    }
  }
  onLedMoved (address, index, position) {
    let paperLED = this.getPaperLED(address, index)
    if (paperLED) {
      paperLED.set({ position })
    }
    if (this.$paperLine) {
      let lineIndex = this.getLinePointIndex(address)
      this.$paperLine.setMultiPoint(lineIndex, index, position)
    }
  }
  refresh () {
    // TODO: refresh the PaperLEDs
  }
  refreshPaperLead (paperLead, lead, address, index) {
    if (!PLD.isLead(lead)) {
      throw new TypeError('Invalid Lead')
    }
    paperLead.set(this.normalizePoint(lead))
    const paperAddress = this.assertPaperAddress(address)
    if (paperAddress && (!paperLead.data.address || paperLead.data.address.id !== paperAddress.id)) {
      if (paperLead.data.address) {
        const oldAddress = paperLead.data.address
        const oldAddressIndex = oldAddress.leads.indexOf(paperLead)
        if (oldAddressIndex !== -1) {
          oldAddress.leads.splice(oldAddressIndex, 1)
        }
      }
      paperAddress.leads.splice(index, 0, paperLead)
      paperLead.data.address = paperAddress
      paperLead.data.leadIndex = index
    }
    return paperLead
  }
  refreshPaperLED (paperLED, LED, address, index) {
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
      paperLED.data.LED = LED
      paperLED.data.LEDindex = index
    }
    return paperLED
  }
}

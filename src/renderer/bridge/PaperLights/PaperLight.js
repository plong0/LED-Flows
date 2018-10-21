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
        paperAddress.leads.splice(index, 0, paperLead)
        if (!paperLead.data) {
          paperLead.data = {}
        }
        paperLead.data.light = this.$model
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
        paperLED.data.light = this.$model
        paperLED.data.address = paperAddress
        paperLED.data.LED = LED
        paperLED.data.LEDindex = index
        this.theme.apply(this.theme.styleForLED, paperLED)
        return this.refreshPaperLED(paperLED, LED, address, index)
      }
    }
  }
  getLinePoint (index = null) {
    const segmentAddress = this.getLineSegmentAddress(index, true)
    if (segmentAddress && this.$paperLEDs.hasOwnProperty(segmentAddress.address)) {
      const paperAddress = this.$paperLEDs[segmentAddress.address]
      if (segmentAddress.addressIndex === null) {
        // all LEDs
        return {
          address: paperAddress,
          LEDs: paperAddress.LEDs,
          points: paperAddress.LEDs.map((LED) => ({ x: LED.position.x, y: LED.position.y }))
        }
      } else if (segmentAddress.addressIndex >= 0 && segmentAddress.addressIndex < paperAddress.leads.length) {
        // a lead
        return {
          address: paperAddress,
          lead: paperAddress.leads[segmentAddress.addressIndex],
          points: [{ x: paperAddress.leads[segmentAddress.addressIndex].x, y: paperAddress.leads[segmentAddress.addressIndex].y }]
        }
      }
    }
  }
  getLinePointIndex (address = null, index = null) {
    // index === null gets index for LEDs
    const addresses = this.paperAddresses
    let pointIndex = 0
    for (let key of addresses) {
      const paperAddress = this.$paperLEDs[key]
      if (parseInt(key) === address) {
        if (index === null) {
          // LED index at the end of leads
          pointIndex += paperAddress.leads.length
        } else if (paperAddress.leads.length) {
          pointIndex += index
        }
        // address is found and pointIndex offset apppropriately
        break
      } else {
        pointIndex += paperAddress.leads.length + (paperAddress.LEDs.length ? 1 : 0) // (+ 1 for LEDs because they always group)
      }
    }
    return pointIndex
  }
  getLineSegmentAddress (segmentIndex, includeEnds = false) {
    // if segmentIndex < 0, return from end of line (with -1 as origin)
    if (segmentIndex === null) {
      segmentIndex = -1
    }
    const reverse = (segmentIndex < 0)
    const addresses = Object.keys(this.$paperLEDs).sort((a, b) => (reverse ? (b - a) : (a - b)))
    let lastAddress = null
    let pointIndex = 0
    if (reverse) {
      segmentIndex = -segmentIndex - 1
    }
    for (let key of addresses) {
      const paperAddress = this.$paperLEDs[key]
      const addressLength = paperAddress.leads.length + (paperAddress.LEDs.length ? 1 : 0)
      key = parseInt(key)
      if (key === 0 && !paperAddress.leads.length && (!includeEnds || !paperAddress.LEDs.length)) {
        // skip address 0 if it has no leads, it has no line segments
        continue
      }
      if (lastAddress !== null && lastAddress.LEDs.length > 1 && paperAddress.LEDs.length > 1 && !paperAddress.leads.length) {
        // multi-point to multi-point has an extra segment
        pointIndex += 1
      }
      if (pointIndex + addressLength > segmentIndex) {
        // match somewhere in this address
        let offset = segmentIndex - pointIndex
        if (includeEnds) {
          if (!reverse && offset === paperAddress.leads.length) {
            offset++
          } else if (reverse && offset === 0) {
            offset--
          }
        }
        if (paperAddress.leads.length && offset >= 0 && offset <= paperAddress.leads.length) {
          return {
            address: key,
            addressIndex: reverse ? (paperAddress.leads.length - offset) : offset
          }
        } else if (paperAddress.LEDs.length) {
          return {
            address: key,
            addressIndex: null
          }
        }
      }
      pointIndex += addressLength
      lastAddress = paperAddress
    }
  }
  getPaperLead (address, index) {
    if (this.$PL.assertPaper()) {
      const paperAddress = this.assertPaperAddress(address, false)
      if (paperAddress && index >= 0 && index < paperAddress.leads.length) {
        return paperAddress.leads[index]
      }
    }
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
  onAddressesShifted (from, amount) {
    this.shiftPaperAddresses(from - 1, amount)
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
          this.addPaperLinePoint(address, paperLED, this.light.LEDs[address].LEDs.length > 1)
        }
      } catch (error) {
        // Bad LED
      }
    }
  }
  onLeadDeleted (address, index) {
    let paperLead = this.getPaperLead(address, index)
    let lineIndex = this.getLinePointIndex(address, index)
    if (paperLead) {
      this.$paperLEDs[address].leads.splice(index, 1)
      this.refreshPaperAddress(address)
    }
    if (this.$paperLine) {
      this.$paperLine.removeMultiPoint(lineIndex, 0)
    }
  }
  onLedDeleted (address, index) {
    let paperLED = this.getPaperLED(address, index)
    let lineIndex = this.getLinePointIndex(address, null)
    if (paperLED) {
      paperLED.remove()
      this.$paperLEDs[address].LEDs.splice(index, 1)
      this.refreshPaperAddress(address)
    }
    if (this.$paperLine) {
      this.$paperLine.removeMultiPoint(lineIndex, index)
    }
  }
  onLeadMoved (address, index, position) {
    if (this.$paperLine) {
      let lineIndex = this.getLinePointIndex(address, index)
      this.$paperLine.setMultiPoint(lineIndex, 0, position)
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
  onLeadsTransferred (from, to, start, count, insert) {
    const paperFrom = this.assertPaperAddress(from, false)
    const paperTo = this.assertPaperAddress(to, false)
    const fromIndex = this.getLinePointIndex(from, start)
    const toIndex = this.getLinePointIndex(to, insert)
    if (paperFrom && paperTo && start >= 0 && start < paperFrom.leads.length) {
      const leads = paperFrom.leads.splice(start, count || paperFrom.leads.length)
      paperTo.leads.splice(insert || 0, 0, ...leads)
      this.refreshPaperAddress(from)
      this.refreshPaperAddress(to)
      if (this.$paperLine) {
        if (to !== from + 1 || insert !== 0 || paperFrom.LEDs.length) {
          // update paperLine on non-consecutive transfer
          this.$paperLine.shiftPoints(fromIndex, toIndex, count)
        }
      }
    }
  }
  refresh () {
    // TODO: refresh the PaperLEDs
  }
  refreshPaperAddress (address) {
    const paperAddress = this.assertPaperAddress(address, false)
    if (!paperAddress.LEDs.length && !paperAddress.leads.length) {
      this.$paperLEDs[address].group.remove()
      delete this.$paperLEDs[address]
      this.shiftPaperAddresses(address, -1)
    } else {
      for (let i = 0; i < paperAddress.LEDs.length; i++) {
        let paperLED = paperAddress.LEDs[i]
        paperLED.data.address = paperAddress
        paperLED.data.LEDindex = i
      }
      for (let i = 0; i < paperAddress.leads.length; i++) {
        let paperLead = paperAddress.leads[i]
        paperLead.data.address = paperAddress
        paperLead.data.leadIndex = i
      }
    }
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
  shiftPaperAddresses (after, amount = 1) {
    const keys = Object.keys(this.$paperLEDs)
      .filter(value => (parseInt(value) > after))
      .sort((a, b) => (amount < 0) ? (a - b) : (b - a))
    for (let key of keys) {
      const newKey = parseInt(key) + amount
      this.$paperLEDs[newKey] = this.$paperLEDs[key]
      this.$paperLEDs[newKey].id = newKey
      this.$paperLEDs[newKey].group.name = `light-leds-address-${this.id}-${newKey}`
      this.$paperLEDs[key] = undefined
      delete this.$paperLEDs[key]
    }
  }
}

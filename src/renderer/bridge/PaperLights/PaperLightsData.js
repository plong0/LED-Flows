const PaperLightsData = {
  hasID: (value) => (
    value && value.hasOwnProperty('id')
  ),
  isLead: (lead) => (
    PaperLightsData.isPoint(lead)
  ),
  isLED: (LED) => (
    PaperLightsData.isPoint(LED)
  ),
  isLight: (light) => (
    PaperLightsData.hasID(light) && Array.isArray(light.LEDs)
  ),
  isPoint: (value) => {
    return value && !isNaN(value.x) && !isNaN(value.y) && value.x !== null && value.y !== null
  }
}
export default PaperLightsData

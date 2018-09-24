export default {
  isLED: (LED) => (
    LED && !isNaN(LED.x) && !isNaN(LED.y) && LED.x !== null && LED.y !== null
  ),
  isLight: (light) => (
    light && light.hasOwnProperty('id') && Array.isArray(light.LEDs)
  )
}

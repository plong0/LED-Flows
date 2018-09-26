<template>
  <v-container fluid>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1>
        <v-btn
          large
          icon
          :color="buttonColor('Tool/AddLed')"
          @click="activateTool('AddLed')"
        >
          <v-icon>far fa-dot-circle</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs12 sm10 md8>
        <v-responsive :aspect-ratio="4/3">
          <canvas ref="canvas"></canvas>
        </v-responsive>
      </v-flex>
    </v-layout>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm2></v-flex>
      <v-flex xs12 sm9 md7>
        <size-context :size="size">
          <light-summary :light="activeLight" :size="size"></light-summary>
        </size-context>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import PaperLights from '@/bridge/PaperLights/PaperLights'
  import colors from 'vuetify/es5/util/colors'
  import SizeContext from '@/components/Utils/SizeContext'
  import LightSummary from '@/components/Lights/LightSummary'

  export default {
    name: 'led-map',
    components: { SizeContext, LightSummary },
    data: () => ({
      lightMap: null,
      canvasWidth: 0
    }),
    computed: {
      size () {
        if (this.canvasWidth < 500) {
          return 'xs'
        } else if (this.canvasWidth < 640) {
          return 'sm'
        } else if (this.canvasWidth < 800) {
          return 'md'
        } else if (this.canvasWidth < 1100) {
          return 'lg'
        } else if (this.canvasWidth >= 1100) {
          return 'xl'
        }
      },
      ...mapGetters({
        activeLight: 'Lights/activeLight',
        lights: 'Lights/lights'
      })
    },
    created () {
      this.$store.subscribe(this.storeUpdated)
    },
    mounted () {
      window.addEventListener('resize', this.refreshCanvasWidth)
      this.refreshCanvasWidth()
      this.$nextTick(this.refreshCanvasWidth)
      this.lightMap = new PaperLights({
        canvas: this.$refs.canvas,
        actions: {
          addLED: this.addLED,
          addLight: this.addLight
        },
        theme: {
          'LED-radius': 25,
          'LED-style-fillColor': this.$vuetify.theme.secondary,
          'LED-style-strokeColor': colors.lime.accent2
        },
        lights: this.lights
      })
    },
    methods: {
      activateTool (name) {
        this.lightMap.activateTool(name)
      },
      addLED (light, address, LED) {
        console.log(`LEDMap addLED @ [${LED.x}, ${LED.y}] => `, light, address)
      },
      addLight (location) {
        console.log(`LEDMap addLight @ [${location.x}, ${location.y}]`)
      },
      buttonColor (name) {
        if (this.isActiveTool(name)) {
          return 'accent'
        }
        return 'secondary'
      },
      isActiveTool (name) {
        return (name.startsWith('Tool') && this.lightMap && this.lightMap.activeTool === name.substr(5))
      },
      ledsAdded (light, address, LEDs) {
        this.lightMap.ledsAdded(light, address, LEDs)
      },
      refreshCanvasWidth () {
        this.canvasWidth = (this.$refs.canvas && this.$refs.canvas.offsetWidth)
      },
      storeUpdated ({ type, payload }, state) {
        switch (type) {
          case 'Lights/ADD_LEDS':
            this.ledsAdded(payload.light, payload.address, payload.LEDs)
            break
        }
      }
    }
  }
</script>

<style scoped>
  canvas {
    border: 1px solid var(--theme-primary);
    width: 100%;
    height: 100%;
    display: block;
  }
</style>

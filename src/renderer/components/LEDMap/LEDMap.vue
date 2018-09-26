<template>
  <v-container fluid>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1>
        <v-btn
          large
          icon
          color="accent"
        >
          <v-icon>fa-info</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs12 sm10 md8>
        <v-responsive :aspect-ratio="4/3">
          <canvas ref="canvas"></canvas>
        </v-responsive>
      </v-flex>
    </v-layout>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1></v-flex>
      <v-flex xs12 sm10 md8>
        <v-btn
          large
          icon
          :color="buttonColor('Tool/AddLed')"
          @click="activateTool('AddLed')"
        >
          <v-icon>far fa-dot-circle</v-icon>
        </v-btn>
        <v-btn
          large
          icon
          :color="buttonColor('Tool/Edit')"
        >
          <v-icon>fa-pencil-alt</v-icon>
        </v-btn>
        <v-btn
          large
          icon
          :color="buttonColor('Star')"
        >
          <v-icon>fa-star</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import PaperLights from '@/bridge/PaperLights/PaperLights'
  import colors from 'vuetify/es5/util/colors'

  export default {
    name: 'led-map',
    data: () => ({
      lightMap: null
    }),
    computed: {
      ...mapGetters({
        lights: 'Lights/lights'
      })
    },
    created () {
      this.$store.subscribe(this.storeUpdated)
    },
    mounted () {
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

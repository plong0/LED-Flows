<template>
  <v-container fluid>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1>
        <v-btn
          icon
          :color="buttonColor('Tool/AddLed')"
          @click="activateTool('AddLed')"
        >
          <v-icon>far fa-dot-circle</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs12 sm10 md8>
        <v-responsive :aspect-ratio="4/3" class="canvas-wrapper">
          <div ref="canvasDummy" class="canvas-dummy"></div>
          <canvas ref="canvas" width="1280" height="960"></canvas>
        </v-responsive>
      </v-flex>
    </v-layout>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm2></v-flex>
      <v-flex xs12 sm9 md7>
        <size-context :size="size">
          <light-summary :light="activeLight" empty-text="It's so beautiful!"></light-summary>
        </size-context>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import PaperLights from '@/bridge/PaperLights/PaperLights'
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
        if (this.canvasWidth < 300) {
          return 'xs'
        } else if (this.canvasWidth < 360) {
          return 'sm'
        } else if (this.canvasWidth < 600) {
          return 'md'
        } else if (this.canvasWidth < 900) {
          return 'lg'
        } else if (this.canvasWidth >= 900) {
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
      window.addEventListener('resize', this.refreshCanvasSize)
      this.refreshCanvasSize()
      this.$nextTick(this.refreshCanvasSize)
      this.lightMap = new PaperLights({
        canvas: this.$refs.canvas,
        actions: {
          addLED: this.addLED,
          addLight: this.addLight
        },
        theme: {
          'LED-style-fillColor': this.$vuetify.theme.secondary,
          'LED-style-strokeColor': ''
        },
        lights: this.lights
      })
    },
    methods: {
      activateTool (name) {
        this.lightMap.activateTool(name)
      },
      addLED (light, address, LED) {
        if (LED) {
          if (light) {
            this.$store.dispatch('Lights/addLED', { light, address, LED })
          } else {
            this.addLight().then(light => {
              this.$store.dispatch('Lights/addLED', { light, address, LED })
            })
          }
        }
      },
      addLight () {
        return this.$store.dispatch('Lights/createLight').then(light => {
          this.$store.dispatch('Lights/activateLight', light)
          return light
        })
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
      lightActivated (light) {
        this.lightMap.activateLight(light)
      },
      refreshCanvasSize () {
        if (this.$refs.canvasDummy) {
          const width = this.$refs.canvasDummy.offsetWidth
          const height = this.$refs.canvasDummy.offsetHeight
          if (this.lightMap) {
            this.lightMap.resizeCanvas(width, height)
          }
          this.canvasWidth = width
        }
      },
      storeUpdated ({ type, payload }, state) {
        switch (type) {
          case 'Lights/ADD_LEDS':
            this.ledsAdded(payload.light, payload.address, payload.LEDs)
            break
          case 'Lights/ACTIVATE_LIGHT':
            this.lightActivated(payload)
            break
        }
      }
    }
  }
</script>

<style scoped>
  .canvas-wrapper {
    position: relative;
    border: 1px solid var(--theme-primary);
  }
  .canvas-dummy {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;
    visibility: hidden;
  }
  canvas {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    display: block;
  }
</style>

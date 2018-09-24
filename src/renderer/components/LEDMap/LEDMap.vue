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
          color="primary"
        >
          <v-icon>fa-plus</v-icon>
        </v-btn>
        <v-btn
          large
          icon
          color="secondary"
        >
          <v-icon>fa-pencil-alt</v-icon>
        </v-btn>
        <v-btn
          large
          icon
          color="accent"
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
        theme: {
          'LED-radius': 25,
          'LED-style-fillColor': this.$vuetify.theme.secondary,
          'LED-style-strokeColor': colors.lime.accent2
        },
        lights: this.lights
      })
    },
    methods: {
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

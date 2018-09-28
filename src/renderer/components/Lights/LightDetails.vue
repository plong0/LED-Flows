<template>
  <v-card>
    <v-card-title>
      <h6 class="title">{{light.name}}</h6>
      <v-btn
        icon
        small
        right
        absolute
        @click="onClose"
        v-if="onClose"
        color="primary"
      >
        <v-icon small>fa-times</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-title>
      <v-layout row wrap justify-space-between>
        <v-flex xs12 lg5>
          [ {{firstAddress}} - {{lastAddress}} ]
          <span class="caption font-weight-light font-italic
">( {{addressCount}} {{addressCount | pluralize('address', 'addresses')}} )</span>
        </v-flex>
        <v-divider vertical class="hidden-md-and-down"></v-divider>
        <v-flex xs4 lg2 class="text-lg-center">
          {{ledCount}} {{ledCount | pluralize('LED')}}
        </v-flex>
        <v-divider vertical class="hidden-md-and-down"></v-divider>
        <v-flex xs7 lg4 class="text-xs-right">
          Center: <coordinates :x="location.x" :y="location.y"></coordinates>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <light-leds :light="light" :addLED="addLED" :address-offset="addressOffset" :max-visible="maxVisibleLEDs"></light-leds>
    </v-card-text>
  </v-card>
</template>

<script>
  import Coordinates from '@/components/Geometry/Coordinates'
  import LightLeds from './LightLeds'

  export default {
    components: { Coordinates, LightLeds },
    props: {
      addLED: {
        type: Function
      },
      light: {
        type: Object,
        required: true,
        validator: (light) => {
          return (light && light.hasOwnProperty('id') && Array.isArray(light.LEDs))
        }
      },
      onClose: {
        type: Function
      }
    },
    computed: {
      addressCount () {
        return this.$store.getters['Lights/addressCount'](this.light.id)
      },
      addressOffset () {
        if (typeof this.firstAddress === 'number') {
          return this.firstAddress
        }
        return 0
      },
      firstAddress () {
        return this.$store.getters['Lights/addressFirst'](this.light.id)
      },
      lastAddress () {
        return this.$store.getters['Lights/addressLast'](this.light.id)
      },
      ledCount () {
        return this.$store.getters['Lights/ledCount'](this.light.id)
      },
      location () {
        const bounds = this.$store.getters['Lights/bounds'](this.light.id)
        return bounds.center
      },
      maxVisibleLEDs () {
        if (this.$vuetify.breakpoint.lgAndUp) {
          return 30
        }
        return 24
      }
    }
  }
</script>

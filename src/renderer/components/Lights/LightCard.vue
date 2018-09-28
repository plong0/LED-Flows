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
      <light-details :light="light"></light-details>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <light-leds :light="light" :addLED="addLED" :address-offset="addressOffset" :max-visible="maxVisibleLEDs"></light-leds>
    </v-card-text>
  </v-card>
</template>

<script>
  import LightDetails from './LightDetails'
  import LightLeds from './LightLeds'

  export default {
    components: { LightDetails, LightLeds },
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
      addressOffset () {
        if (typeof this.firstAddress === 'number') {
          return this.firstAddress
        }
        return 0
      },
      firstAddress () {
        return this.$store.getters['Lights/addressFirst'](this.light.id)
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

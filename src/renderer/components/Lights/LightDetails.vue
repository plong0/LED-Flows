<template>
  <v-card>
    <v-card-title>
      <h3>{{light.name}}</h3>
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
        <v-flex xs12 sm5 md2>
          <strong>ID:</strong> {{light.id}}
        </v-flex>
        <v-divider vertical class="hidden-xs-only"></v-divider>
        <v-flex xs12 sm6 md5 class="text-sm-right text-md-center">
          <strong>Address:</strong> 64
        </v-flex>
        <v-divider vertical class="hidden-sm-and-down"></v-divider>
        <v-flex xs12 sm12 md4 class="text-sm-right">
          <strong>Loc:</strong> [ {{light.location.x}} , {{light.location.y}} ]
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <h4>LEDs</h4>
      <light-leds :light="light" :addLED="addLED"></light-leds>
    </v-card-text>
  </v-card>
</template>

<script>
  import LightLeds from './LightLeds'

  export default {
    components: { LightLeds },
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
    }
  }
</script>

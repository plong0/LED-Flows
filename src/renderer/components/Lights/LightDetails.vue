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
        <v-flex xs12 md3>
          <strong>ID:</strong> #{{light.id}}
        </v-flex>
        <v-flex xs12 sm6 md3>
          <strong>Address:</strong> {{light.id}}
        </v-flex>
        <v-flex xs12 sm6 md4>
          <strong>Loc:</strong> [ 100 , 200 ]
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <h4>LEDs</h4>
      <v-layout row wrap>
        <v-flex
          xs2 lg1
          v-for="(LEDs, address) in light.LEDs"
          :key="`${light.id}.${address}`"
        >
          <v-btn
            small
            icon
            color="accent"
          >
            <v-badge
              bottom
              color="success"
              :value="LEDs.length > 1"
            >
              <span slot="badge">{{LEDs.length}}</span>
              {{address}}
            </v-badge>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout row wrap justify-center class="mt-1">
        <v-btn
          round
          color="secondary"
          @click="addLED(light)"
        >
          <v-icon left>fa-plus</v-icon>
          Add LED
        </v-btn>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    props: {
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
    methods: {
      addLED (light, address) {
        this.$store.dispatch('Lights/addLED', {light, LED: {x: 50, y: 50}, address})
      }
    }
  }
</script>

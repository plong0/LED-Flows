<template>
  <v-layout column>
    <v-flex class="mb-3">
      <h2 class="mb-1">Lights</h2>
      <v-divider></v-divider>
    </v-flex>
    <v-flex>
      <v-select ref="activeSelect"
        outline
        label="Active Light"
        no-data-text="No lights found"
        :items="lights"
        item-value="id"
        :item-text="lightTitle"
        v-model="activeID"
        type="number"
        @change="loadLight"
      >
      </v-select>
    </v-flex>
    <v-flex :style="{ position: 'relative' }">
      <v-slide-y-transition>
        <h3 v-show="!lightSelected" :style="absoluteStyle" class="text-xs-center accent2--text font-weight-regular font-italic">{{message}}</h3>
      </v-slide-y-transition>
      <v-slide-y-transition>
        <v-layout row wrap justify-center v-show="!lightSelected" :style="absoluteStyle" class="mt-3">
          <v-btn
            round
            color="primary"
            @click.native.stop="addLight()"
          >
            <v-icon left>fa-plus</v-icon>
            New Light
          </v-btn>
        </v-layout>
      </v-slide-y-transition>
      <v-scale-transition>
        <light-details v-if="light" :light="light" :addLED="addLED" :onClose="closeLight">
        </light-details>
      </v-scale-transition>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapGetters } from 'vuex'
  import LightDetails from './LightDetails'

  export default {
    name: 'light-manager',
    components: { LightDetails },
    data: () => ({
      activeID: null
    }),
    computed: {
      absoluteStyle () {
        if (this.light) {
          return { position: 'absolute', left: 0, right: 0 }
        }
      },
      lightSelected () {
        return (this.activeID !== null)
      },
      message () {
        return `${this.lights.length ? 'Select' : 'Add'} a light to ${this.lights.length ? 'continue' : 'start'} the magic.`
      },
      ...mapGetters({
        light: 'Lights/activeLight',
        lights: 'Lights/lights'
      })
    },
    methods: {
      addLight () {
        this.$store.dispatch('Lights/createLight').then(light => {
          this.activeID = light.id
        })
      },
      addLED (light, address) {
        /** TODO: accept a location
          - read location from last LED + compass
          - auto-set compass to vector of last 2 addresses in Light
            - (multi-LED addresses should use an average of all their locations)
        */
        this.$store.dispatch('Lights/addLED', { light, address })
      },
      closeLight () {
        this.activeID = null
      },
      lightTitle (light) {
        if (light && light.hasOwnProperty('id')) {
          return `[#${light.id}] ${light.name}`
        }
        return ''
      },
      loadLight (activeID) {
        if (this.light !== null) {
          // make a transition between lights by clearing it, then setting it on next tick
          this.$store.dispatch('Lights/activateLight')
          this.$nextTick(() => {
            this.$store.dispatch('Lights/activateLight', { id: activeID })
          })
        } else {
          this.$store.dispatch('Lights/activateLight', { id: activeID })
        }
      }
    }
  }
</script>

<style scoped>
</style>

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
        <h3 v-show="!lightSelected" :style="absoluteStyle" class="text-xs-center accent--text font-weight-regular font-italic">{{message}}</h3>
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
        <light-details v-if="lightLoaded" :light="light" :addLED="addLED" :onClose="closeLight">
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
      activeID: null,
      lightID: null
    }),
    computed: {
      absoluteStyle () {
        if (this.lightLoaded) {
          return { position: 'absolute', left: 0, right: 0 }
        }
      },
      lightLoaded () {
        return (this.lightSelected && this.lightID === this.activeID)
      },
      lightSelected () {
        return (this.activeID !== null)
      },
      light () {
        if (this.lightID !== null) {
          return this.$store.getters['Lights/light'](this.lightID)
        }
        return {}
      },
      message () {
        return `${this.lights.length ? 'Select' : 'Add'} a light to ${this.lights.length ? 'continue' : 'start'} the magic.`
      },
      ...mapGetters({
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
        this.$store.dispatch('Lights/addLED', {light, address})
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
        if (this.lightID !== null) {
          // make a transition between lights
          this.lightID = null
          setTimeout(() => {
            this.lightID = activeID
          })
        } else {
          this.lightID = activeID
        }
      }
    }
  }
</script>

<style scoped>
</style>

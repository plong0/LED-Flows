<template>
  <v-layout column>
    <v-flex class="mb-3">
      <h5 class="headline mb-1">Lights</h5>
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
        @change="selectLight"
      >
      </v-select>
    </v-flex>
    <v-flex :style="{ position: 'relative' }">
      <v-slide-y-transition>
        <div v-show="!lightSelected" :style="absoluteStyle">
          <p class="subheading font-weight-medium font-italic text-xs-center accent--text">{{message}}</p>
          <v-divider></v-divider>
        </div>
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
        <light-card v-if="lightLoaded" :light="light" :addLED="addLED" :onClose="closeLight">
        </light-card>
      </v-scale-transition>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapGetters } from 'vuex'
  import LightCard from './LightCard'

  export default {
    name: 'light-manager',
    components: { LightCard },
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
      light () {
        if (this.lightID !== null) {
          return this.$store.getters['Lights/light'](this.lightID)
        }
        return {}
      },
      lightLoaded () {
        return (this.lightSelected && this.lightID === this.activeID)
      },
      lightSelected () {
        return (this.activeID !== null)
      },
      message () {
        return `${this.lights.length ? 'Select' : 'Add'} a light to ${this.lights.length ? 'continue' : 'start'} the magic.`
      },
      ...mapGetters({
        lights: 'Lights/lights'
      })
    },
    created () {
      this.$store.subscribe(this.storeUpdated)
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
        return this.$store.dispatch('Lights/addLED', { light, address })
      },
      closeLight () {
        this.activeID = null
      },
      lightActivated (light) {
        this.loadLight(light ? light.id : null)
      },
      lightTitle (light) {
        if (light && light.hasOwnProperty('id')) {
          const firstAddress = this.$store.getters['Lights/addressFirst'](light.id)
          const lastAddress = this.$store.getters['Lights/addressLast'](light.id)
          return `[ ${firstAddress} - ${lastAddress} ] ~ ${light.name}`
        }
        return ''
      },
      loadLight (lightID) {
        if (this.light !== null) {
          // make a transition between lights by clearing it, then setting it on next tick
          this.lightID = null
          if (lightID !== null) {
            this.$nextTick(() => {
              this.lightID = lightID
              if (this.activeID !== lightID) {
                this.activeID = lightID
              }
            })
          }
        } else {
          this.lightID = lightID
        }
      },
      selectLight (lightID) {
        this.$store.dispatch('Lights/activateLight', { id: lightID })
      },
      storeUpdated ({ type, payload }, state) {
        switch (type) {
          case 'Lights/ACTIVATE_LIGHT':
            this.lightActivated(payload)
            break
        }
      }
    }
  }
</script>

<style scoped>
</style>

<template>
  <v-layout column justify-start>
    <v-flex>
      <h2>Lights ({{count}})</h2>
      <v-card>
        <v-select
          outline
          :items="lights"
          item-value="id"
          :item-text="lightTitle"
          v-model="activeID"
          >
        </v-select>
        [{{activeID}}] - {{lightTitle(light)}}
        <v-btn
          icon
          color="secondary"
          @click="updateLight(light)"
        >
          <v-icon>fa-sync-alt</v-icon>
        </v-btn>
        <v-btn
          icon
          color="accent"
          @click="setLight(light)"
        >
          <v-icon>fa-sync-alt</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile
              v-for="light in lights"
              :key="light.id"
              @click="activeID = light.id"
            >
            <v-list-tile-content>
              <v-list-tile-title>{{lightTitle(light)}} ({{addressCount(light)}})</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>

      <v-btn
        color="success"
        @click.native.stop="addLight()"
      >
        <v-icon>fa-plus</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'light-manager',
    data: () => ({
      activeID: null
    }),
    computed: {
      count () {
        return this.lights.length
      },
      light () {
        if (this.activeID !== null) {
          return this.$store.getters['Lights/light'](this.activeID)
        }
        return {}
      },
      ...mapGetters({
        lights: 'Lights/lights'
      })
    },
    methods: {
      addLight () {
        this.$store.dispatch('Lights/createLight').then(light => {
          console.log('Light Added =>', light)
        })
      },
      lightTitle (light) {
        if (light && light.hasOwnProperty('id')) {
          return `[#${light.id}] - ${light.name}`
        }
        return ''
      },
      addLED (light, address) {
        this.$store.dispatch('Lights/addLED', {light, LED: {x: 50, y: 50}, address})
      },
      addressCount (light) {
        return Object.keys(light.LEDs).length
      },
      updateLight (light) {
        console.log(`updateLight({id: ${light.id}, name: "My Light #${light.id}"})`)
        this.$store.dispatch('Lights/updateLight', {
          id: light.id,
          name: `My Light #${light.id}`
        }).then(light => {
          console.log('Light Updated =>', light)
        })
      },
      setLight (light) {
        this.$store.dispatch('Lights/setLight', {
          ...light,
          name: `Freak Light #${light.id}`
        }).then(light => {
          console.log('Light Set =>', light)
        })
      }
    }
  }
</script>

<style scoped>
</style>

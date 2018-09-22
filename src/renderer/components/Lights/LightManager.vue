<template>
  <v-layout column justify-start>
    <v-flex>
      <h2>Lights ({{count}})</h2>
      <v-btn
        color="success"
        @click.native.stop="addLight()"
      >
        <v-icon>fa-plus</v-icon>
      </v-btn>
      <v-btn
        color="warning"
        @click.native.stop="addFirstLight()"
      >
        <v-icon>fa-plus</v-icon>
      </v-btn>
      <v-btn
        color="error"
        @click.native.stop="addBadLight()"
      >
        <v-icon>fa-plus</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'light-manager',
    data: () => ({
      lights: []
    }),
    computed: {
      count () {
        return this.lights.length
      }
    },
    created () {
      this.lights = this.$store.getters['Lights/lights']
    },
    methods: {
      addLight () {
        const light = {
          id: this.$store.getters['Lights/nextID']
        }
        light.name = `Light #${light.id}`
        this.$store.dispatch('Lights/addLight', light)
      },
      addFirstLight () {
        const light = {
          id: 0
        }
        light.name = `Light #${light.id}`
        this.$store.dispatch('Lights/addLight', light)
      },
      addBadLight () {
        const light = {}
        light.name = `Light #${light.id}`
        this.$store.dispatch('Lights/addLight', light)
      }
    }
  }
</script>

<style scoped>
</style>

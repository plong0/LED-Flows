<template>
  <v-layout column justify-start>
    <v-flex>
      <h2>Lights</h2>
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
  export default {
    name: 'light-manager',
    data: () => ({
      lights: []
    }),
    mounted () {
      this.$data.lights = this.$store.getters['Lights/lights']
    },
    methods: {
      addLight () {
        const light = {
          id: this.$store.getters['Lights/nextID']
        }
        light.name = `Light #${light.id}`
        this.$store.dispatch('Lights/addLight', light)
      }
    }
  }
</script>

<style scoped>
</style>

<template>
  <v-container fluid>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1>
        <v-btn
          large
          icon
          color="accent"
        >
          <v-icon>fa-info</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs12 sm10 md8>
        <v-responsive :aspect-ratio="4/3">
          <canvas ref="canvas"></canvas>
        </v-responsive>
      </v-flex>
    </v-layout>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1></v-flex>
      <v-flex xs12 sm10 md8>
        <v-btn
          large
          icon
          color="primary"
        >
          <v-icon>fa-plus</v-icon>
        </v-btn>
        <v-btn
          large
          icon
          color="secondary"
        >
          <v-icon>fa-pencil-alt</v-icon>
        </v-btn>
        <v-btn
          large
          icon
          color="accent"
        >
          <v-icon>fa-star</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import paper from 'paper'
  // import colors from 'vuetify/es5/util/colors'

  export default {
    name: 'led-map',
    data: () => ({
      paper: null
    }),
    mounted () {
      this.paper = paper.setup(this.$refs.canvas)
    }
  }
</script>

<style scoped>
  canvas {
    border: 1px solid var(--theme-primary);
    width: 100%;
    height: 100%;
    display: block;
  }
</style>

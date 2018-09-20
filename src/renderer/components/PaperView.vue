<template>
  <v-layout column justify-start>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1>
        <v-btn
          icon
          color="accent"
        >
          <v-icon>info</v-icon>
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
          icon
          color="accent"
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
  import paper from 'paper'

  export default {
    name: 'paper',
    data: () => ({
      paper: null
    }),
    mounted () {
      this.$data.paper = paper.setup(this.$refs.canvas)
      const point = new paper.Point(50, 50)
      const size = new paper.Size(150, 250)
      let shape = new paper.Shape.Rectangle(point, size)
      shape.strokeColor = this.$vuetify.theme.accent
      shape.strokeWidth = 10
      shape.fillColor = this.$vuetify.theme.secondary
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

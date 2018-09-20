<template>
  <v-layout column justify-center>
    <v-flex xs12>
      <v-responsive justify-center :aspect-ratio="4/3" max-width="800" max-height="600">
        <canvas ref="canvas"></canvas>
      </v-responsive>
    </v-flex>
  </v-layout>
</template>

<script>
  import paper from 'paper'

  export default {
    name: 'paper',
    data () {
      return {
        paper: null
      }
    },
    mounted () {
      this.$data.paper = paper.setup(this.$refs.canvas)
      const point = new paper.Point(50, 50)
      const size = new paper.Size(150, 250)
      let shape = new paper.Shape.Rectangle(point, size)
      shape.strokeColor = '#558b2f'
      shape.strokeWidth = 10
      shape.fillColor = '#7986cb'
    }
  }
</script>

<style scoped>
  canvas {
    border: 1px solid #7e57c2;
    width: 100%;
    height: 100%;
    display: block;
  }

</style>
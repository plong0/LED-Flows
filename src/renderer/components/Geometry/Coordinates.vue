<template>
  <span class="text-wrap-none">
    ( {{coordinates}} )
  </span>
</template>

<script>
  export default {
    props: {
      precision: {
        type: Number,
        default: 0
      },
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      },
      z: {
        type: Number
      }
    },
    computed: {
      coordinates () {
        return `${this.coordinate(this.x)} , ${this.coordinate(this.y)}` + (!isNaN(this.z) ? ` , ${this.coordinate(this.z)}` : '')
      }
    },
    methods: {
      coordinate (value) {
        if (typeof value === 'number') {
          return value.toFixed(this.precision)
        }
      }
    }
  }
</script>

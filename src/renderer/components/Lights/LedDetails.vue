<template>
  <v-layout row wrap justify-space-between :style="{ minWidth: this.minWidth }">
    <v-flex xs12 v-if="hasLight">
      <strong>{{light.name}}</strong>
    </v-flex>
    <v-flex xs5 class="text-wrap-none" v-if="hasAddresses">
      <span v-if="hasAddress">
        <strong>[ {{address}} ]</strong>
      </span>
      {{'~' | hide(!hasAddress || !hasLocalAddress)}}
      <span v-if="hasLocalAddress">
        <strong>[ {{localAddress}} ]</strong>
      </span>
      <span v-if="hasAddressIndex">
        ({{addressIndex}})
      </span>
    </v-flex>
    <v-flex xs5 :class="{ 'text-xs-right': hasAddresses }">
      <coordinates :x="led.x" :y="led.y"></coordinates>
    </v-flex>
  </v-layout>
</template>

<script>
  import Coordinates from '@/components/Geometry/Coordinates'

  export default {
    components: { Coordinates },
    props: {
      address: {
        type: Number,
        default: null,
        validator: (address) => {
          return (address === null || typeof address === 'number')
        }
      },
      addressIndex: {
        type: Number,
        default: null,
        validator: (addressIndex) => {
          return (addressIndex === null || typeof addressIndex === 'number')
        }
      },
      led: {
        type: Object,
        default: { x: 0, y: 0 },
        validator: (led) => {
          return (led && led.hasOwnProperty('x') && led.hasOwnProperty('y'))
        }
      },
      light: {
        type: Object,
        default: null,
        validator: (light) => {
          return (light === null || typeof light === 'object')
        }
      },
      localAddress: {
        type: Number,
        default: null,
        validator: (localAddress) => {
          return (localAddress === null || typeof localAddress === 'number')
        }
      },
      minWidth: {
        type: String,
        default: null
      }
    },
    computed: {
      hasAddress () {
        return (this.address !== null)
      },
      hasAddresses () {
        return (this.hasAddress || this.hasLocalAddress)
      },
      hasAddressIndex () {
        return (this.addressIndex !== null)
      },
      hasLight () {
        return (this.light !== null)
      },
      hasLocalAddress () {
        return (this.localAddress !== null)
      }
    }
  }
</script>

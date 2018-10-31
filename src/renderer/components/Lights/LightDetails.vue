<template>
  <v-layout row wrap justify-space-between>
    <v-flex xs12 md7 lg5>
      [ {{firstAddress}} - {{lastAddress}} ]
      <span class="caption font-weight-light font-italic
">( {{addressCount}} {{addressCount | pluralize('address', 'addresses')}} )</span>
    </v-flex>
    <v-divider vertical class="hidden-md-and-down"></v-divider>
    <v-flex xs5 md4 lg3 class="text-md-right text-lg-center">
      {{ledCount}} {{ledCount | pluralize('LED')}}
    </v-flex>
    <v-divider vertical class="hidden-md-and-down"></v-divider>
    <v-flex xs6 md12 lg3 class="text-xs-right">
      <coordinates :x="location.x" :y="location.y"></coordinates>
    </v-flex>
  </v-layout>
</template>

<script>
  import Coordinates from '@/components/Geometry/Coordinates';

  export default {
    components: { Coordinates },
    props: {
      light: {
        type: Object,
        required: true,
        validator: (light) => {
          return (light && light.hasOwnProperty('id') && Array.isArray(light.LEDs));
        }
      }
    },
    computed: {
      addressCount () {
        return this.$store.getters['Lights/addressCount'](this.light.id);
      },
      firstAddress () {
        return this.$store.getters['Lights/addressFirst'](this.light.id);
      },
      lastAddress () {
        return this.$store.getters['Lights/addressLast'](this.light.id);
      },
      ledCount () {
        return this.$store.getters['Lights/ledCount'](this.light.id);
      },
      location () {
        const bounds = this.$store.getters['Lights/bounds'](this.light.id);
        return bounds.center;
      }
    }
  };
</script>

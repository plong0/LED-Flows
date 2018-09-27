<template>
  <v-card flat ripple>
    <v-slide-x-transition leave-absolute>
      <v-card-text class="text-xs-center" v-if="!lightLoaded && emptyText" key="emptyText">
        <span class="secondary--text font-weight-regular font-italic">{{emptyText}}</span>
      </v-card-text>
      <v-card-text v-if="lightLoaded && !lightChanging" key="light">
        <v-layout row wrap justify-space-between>
          <v-flex xs5 sm4 md5>
            <strong>{{light.name}}</strong>
          </v-flex>
          <v-divider vertical></v-divider>
          <v-flex xs5 sm2 class="text-xs-right text-sm-center">
            {{ledCount}} {{ledCount | pluralize('LED')}}
          </v-flex>
          <v-divider vertical class="hidden-xs-only"></v-divider>
          <v-divider class="flex xs12 hidden-sm-and-up"></v-divider>
          <v-flex xs5 sm2 class="text-xs-left text-sm-center">
            [ {{firstAddress}} - {{lastAddress}} ]
          </v-flex>
          <v-divider vertical></v-divider>
          <v-flex xs5 sm3 md2 class="text-xs-right">
            ( {{location.x | toFixed(0)}} , {{location.y | toFixed(0)}} )
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-slide-x-transition>
  </v-card>
</template>

<script>
  export default {
    props: {
      light: {
        type: Object,
        default: null
      },
      emptyText: {
        type: String,
        default: ''
      }
    },
    data: () => ({
      lightChanging: false
    }),
    watch: {
      light (light, oldLight) {
        if (light && oldLight && light !== oldLight) {
          this.lightChanging = true
          this.$nextTick(() => {
            this.lightChanging = false
          })
        }
      }
    },
    computed: {
      firstAddress () {
        if (this.lightLoaded) {
          return this.$store.getters['Lights/addressFirst'](this.light.id)
        }
      },
      lastAddress () {
        if (this.lightLoaded) {
          return this.$store.getters['Lights/addressLast'](this.light.id)
        }
      },
      lightLoaded () {
        return (this.light && this.light.hasOwnProperty('id'))
      },
      ledCount () {
        if (this.lightLoaded) {
          return this.$store.getters['Lights/ledCount'](this.light.id)
        }
      },
      location () {
        if (this.lightLoaded) {
          return this.$store.getters['Lights/location'](this.light.id)
        }
      }
    }
  }
</script>

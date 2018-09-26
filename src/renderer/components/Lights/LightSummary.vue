<template>
  <v-card flat ripple>
    <v-slide-x-transition leave-absolute>
      <v-card-text v-if="!lightLoaded && emptyText" key="emptyText">
        <span class="secondary--text font-weight-regular font-italic">{{emptyText}}</span>
      </v-card-text>
      <v-card-text v-if="lightLoaded" key="light">
        <v-layout row wrap justify-space-between>
          <v-flex xs3 sm2 md1>
            <strong>ID: {{light.id}}</strong>
          </v-flex>
          <v-divider vertical class="hidden-xs-only"></v-divider>
          <v-flex xs8 sm6 md5 class="text-xs-right text-sm-center">
            <strong>{{light.name}}</strong>
          </v-flex>
          <v-divider vertical class="hidden-xs-only"></v-divider>
          <v-flex xs5 sm3 class="text-xs-left text-sm-right text-md-center">
            <strong>Address:</strong> 64
          </v-flex>
          <v-divider vertical class="hidden-sm-and-down"></v-divider>
          <v-flex xs5 sm12 md2 class="text-xs-right">
            <strong>[ 100 , 200 ]</strong>
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
        default: 'No light selected'
      }
    },
    computed: {
      lightLoaded () {
        return (this.light && this.light.hasOwnProperty('id'))
      }
    }
  }
</script>

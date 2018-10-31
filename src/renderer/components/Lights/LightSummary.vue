<template>
  <v-card flat ripple>
    <v-slide-x-transition leave-absolute>
      <v-card-text class="text-xs-center" v-if="!lightLoaded && emptyText" key="emptyText">
        <span class="secondary--text font-weight-regular font-italic">{{emptyText}}</span>
      </v-card-text>
      <v-card-text v-if="lightLoaded && !lightChanging" key="light">
        <v-layout row wrap justify-space-between>
          <v-flex xs12 class="subheading mb-1">
            {{light.name}}
          </v-flex>
        </v-layout>
        <v-divider class="mb-1"></v-divider>
        <light-details :light="light"></light-details>
      </v-card-text>
    </v-slide-x-transition>
  </v-card>
</template>

<script>
  import LightDetails from './LightDetails';

  export default {
    components: { LightDetails },
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
          this.lightChanging = true;
          this.$nextTick(() => {
            this.lightChanging = false;
          });
        }
      }
    },
    computed: {
      lightLoaded () {
        return (this.light && this.light.hasOwnProperty('id'));
      }
    }
  };
</script>

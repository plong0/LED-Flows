<template>
  <v-layout column>
    <v-flex class="mb-3">
      <h5 class="headline mb-1">Lights</h5>
      <v-divider></v-divider>
    </v-flex>
    <v-flex>
      <v-select ref="activeSelect"
        outline
        label="Active Light"
        no-data-text="No lights found"
        :items="lights"
        item-value="id"
        :item-text="lightTitle"
        v-model="activeID"
        type="number"
        @change="selectLight"
      >
      </v-select>
    </v-flex>
    <v-flex class="light">
      <v-slide-y-transition>
        <div v-show="!lightSelected" :style="absoluteStyle">
          <p class="subheading font-weight-medium font-italic text-xs-center accent--text">{{message}}</p>
          <v-divider></v-divider>
        </div>
      </v-slide-y-transition>
      <v-slide-y-transition>
        <v-layout row wrap justify-center v-show="!lightSelected" :style="absoluteStyle" class="mt-3">
          <v-btn
            round
            color="primary"
            @click.native.stop="addLight()"
          >
            <v-icon left>fa-plus</v-icon>
            New Light
          </v-btn>
        </v-layout>
      </v-slide-y-transition>
      <v-scale-transition>
        <light-card class="light-card" v-if="lightLoaded" :light="light" :addLED="addLED" :addLEDParams="addLEDParams" :onClose="closeLight">
        </light-card>
      </v-scale-transition>
    </v-flex>
  </v-layout>
</template>

<script>
  import Geo from '@/utils/Geo';
  import { mapGetters } from 'vuex';
  import LightCard from './LightCard';

  export default {
    name: 'light-manager',
    components: { LightCard },
    data: () => ({
      activeID: null,
      lightID: null,
      addLEDParams: {
        addToStart: false,
        addMode: 'straight',
        compass: {
          active: false,
          angle: 0,
          distance: 0
        }
      }
    }),
    computed: {
      absoluteStyle () {
        if (this.lightLoaded) {
          return { position: 'absolute', left: 0, right: 0 };
        }
      },
      light () {
        if (this.lightID !== null) {
          return this.$store.getters['Lights/light'](this.lightID);
        }
        return {};
      },
      lightLoaded () {
        return (this.lightSelected && this.lightID === this.activeID);
      },
      lightSelected () {
        return (this.activeID !== null);
      },
      message () {
        return `${this.lights.length ? 'Select' : 'Add'} a light to ${this.lights.length ? 'continue' : 'start'} the magic.`;
      },
      ...mapGetters({
        lights: 'Lights/lights'
      })
    },
    created () {
      this.$store.subscribe(this.storeUpdated);
    },
    methods: {
      addLight () {
        this.$store.dispatch('Lights/createLight').then(light => {
          this.activeID = light.id;
        });
      },
      addLED (light, address = null, location = null, toStart = false) {
        // null address creates new LED
        // address set where already existing with LEDs, forces stack
        // null location auto-calculates angle + distance
        let LED = { x: 0, y: 0 };
        let stack = false;
        if (location !== null && typeof location === 'object') {
          // if location definition given, use it
          if (location.hasOwnProperty('x') && location.hasOwnProperty('y')) {
            // specific x,y
            LED = {
              x: location.x,
              y: location.y
            };
          } else if (location.hasOwnProperty('angle') && location.hasOwnProperty('distance')) {
            const endPoint = this.$store.getters['Lights/point'](light.id, (toStart ? 0 : -1));
            const offset = {
              angle: location.angle,
              distance: location.distance
            };
            if (location.angleMode === 'relative') {
              // calculate angle of last two LEDs and add location.angle to it
              const endPoint2 = this.$store.getters['Lights/point'](light.id, (toStart ? 1 : -2));
              if (endPoint && endPoint2) {
                const angle = Geo.calculateAngle(endPoint2.position, endPoint.position);
                if (typeof angle !== 'undefined') {
                  offset.angle += angle;
                }
              }
            }
            // add offset vector to last point
            LED = Geo.addToPoint(endPoint.position, offset);
          }
        } else if (address !== null && light.LEDs.hasOwnProperty(address) && light.LEDs[address].LEDs.length) {
          // auto-calculate when given an address to stack on
          const lastLED = light.LEDs[address].LEDs[light.LEDs[address].LEDs.length - 1];
          LED = {
            x: lastLED.x,
            y: lastLED.y + 25
          };
          stack = true;
        } else {
          // default auto-calculate
          const endPoint = this.$store.getters['Lights/point'](light.id, (toStart ? 0 : -1));
          const endPoint2 = this.$store.getters['Lights/point'](light.id, (toStart ? 1 : -2));
          if (endPoint && endPoint2) {
            LED = {
              x: endPoint.position.x + (endPoint.position.x - endPoint2.position.x),
              y: endPoint.position.y + (endPoint.position.y - endPoint2.position.y)
            };
          }
        }
        if (address === null && toStart) {
          address = 0;
        }
        return this.$store.dispatch('Lights/addLED', { light, address, LED, stack });
      },
      closeLight () {
        this.activeID = null;
      },
      lightTitle (light) {
        if (light && light.hasOwnProperty('id')) {
          const firstAddress = this.$store.getters['Lights/addressFirst'](light.id);
          const lastAddress = this.$store.getters['Lights/addressLast'](light.id);
          return `[ ${firstAddress} - ${lastAddress} ] ~ ${light.name}`;
        }
        return '';
      },
      loadLight (lightID) {
        if (lightID === null) {
          this.lightID = null;
          this.activeID = null;
        } else if (this.light !== null) {
          // make a transition between lights by clearing it, then setting it on next tick
          this.lightID = null;
          if (lightID !== null) {
            this.$nextTick(() => {
              this.lightID = lightID;
              if (this.activeID !== lightID) {
                this.activeID = lightID;
              }
            });
          }
        } else {
          this.lightID = lightID;
        }
      },
      onLightActivated (light) {
        this.loadLight(light ? light.id : null);
      },
      selectLight (lightID) {
        this.$store.dispatch('UI/activateLight', { id: lightID });
      },
      storeUpdated ({ type, payload }, state) {
        switch (type) {
          case 'UI/ACTIVATE_LIGHT':
            this.onLightActivated(payload);
            break;
        }
      }
    }
  };
</script>

<style scoped>
  .layout.column > .flex {
    flex: 0 1 auto;
  }
  .layout.column > .flex.light {
    position: relative;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  .light > .light-card {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow-y: scroll;
  }
</style>

<template>
  <div>
    <v-layout row wrap>
      <v-flex
        xs2 lg1
        v-for="(LEDs, address) in light.LEDs"
        :key="laKey(light, address)"
      >
        <v-hover open-delay="100" close-delay="75">
          <div slot-scope="{ hover }" :style="{ position: 'relative', minHeight: '40px' }">
            <v-slide-y-reverse-transition>
              <v-btn v-show="!hover"
                small
                icon
                color="accent"
              >
                <v-badge
                  bottom
                  color="success"
                  :value="LEDs.length > 1"
                >
                  <span slot="badge">{{LEDs.length}}</span>
                  {{offsetAddress(address)}}
                </v-badge>
              </v-btn>
            </v-slide-y-reverse-transition>
            <v-scroll-y-transition>
              <v-layout column wrap align-content-start class="extra-leds elevation-2" :style="extraLedsStyle(LEDs)" v-if="hover">
                <v-flex
                  v-for="(LED, index) in LEDs"
                  :key="laiKey(light, address, index)"
                >
                  <v-btn
                    small
                    icon
                    color="accent"
                  >
                    {{address}}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-tooltip
                  bottom
                  open-delay="1000"
                  v-if="addLED"
                  >
                    <v-btn
                      slot="activator"
                      small
                      icon
                      color="secondary"
                      @click="addLED(light, address)"
                    >
                      <v-icon small>fa-plus</v-icon>
                    </v-btn>
                    <span>Add a parallel LED (shared address, physically unique)</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-scroll-y-transition>
          </div>
        </v-hover>
      </v-flex>
    </v-layout>
    <v-layout v-if="addLED" row wrap justify-center class="mt-1">
      <v-btn
        round
        color="secondary"
        @click="addLED(light)"
      >
        <v-icon left>fa-plus</v-icon>
        Add LED
      </v-btn>
    </v-layout>
  </div>
</template>

<script>
  export default {
    props: {
      addLED: {
        type: Function
      },
      addressOffset: {
        type: Number,
        default: 0
      },
      light: {
        type: Object,
        required: true,
        validator (light) {
          return (light && light.hasOwnProperty('id') && Array.isArray(light.LEDs))
        }
      }
    },
    methods: {
      extraLedsStyle (LEDs) {
        const rows = 6
        const columns = 3
        const cellHeight = 40
        const cellWidth = 44

        // limit the size of the popup
        let style = {
          maxHeight: (rows * cellHeight) + 'px',
          maxWidth: (columns * cellWidth) + 'px'
        }

        // manually calculate width (https://stackoverflow.com/questions/33891709/when-flexbox-items-wrap-in-column-mode-container-does-not-grow-its-width)
        style.width = (Math.ceil((LEDs.length + 1) / rows) * cellWidth) + 'px'

        // give extra room for scrollbar when it overflows
        if (LEDs.length >= (rows * columns)) {
          style.maxHeight = ((rows * cellHeight) + 20) + 'px'
        }

        return style
      },
      laKey (light, address) {
        return `${light.id}.${address}`
      },
      laiKey (light, address, index) {
        return `${light.id}.${address}.${index}`
      },
      offsetAddress (value) {
        return (value + this.addressOffset)
      }
    }
  }
</script>

<style scoped>
  .extra-leds {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 22px;
    transform: translateX(-50%);
    overflow-x: auto;
    border-radius: 4px;
    background-color: #616161;
  }
</style>

<template>
  <div>
    <v-layout row>
      <v-flex xs1 v-show="hasPreviousPage">
        <v-btn
          flat
          icon
          @click="previousPage()"
        >
          <v-icon>fa-chevron-left</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs10>
        <v-layout row wrap>
          <v-flex
            xs2 lg1
            v-for="(LEDs, address) in limitBy(LEDs, pageLimit, pageOffset)"
            :key="laKey(light, offsetAddress(address))"
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
                      {{offsetAddress(address, true)}}
                    </v-badge>
                  </v-btn>
                </v-slide-y-reverse-transition>
                <v-scroll-y-transition>
                  <v-layout column wrap align-content-start class="extra-leds elevation-2" :style="extraLedsStyle(LEDs)" v-if="hover">
                    <v-flex
                      v-for="(LED, index) in LEDs"
                      :key="laiKey(light, offsetAddress(address), index)"
                    >
                      <v-btn
                        small
                        icon
                        color="accent"
                      >
                        {{offsetAddress(address)}}
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
                          @click="doAddLED(light, offsetAddress(address))"
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
      </v-flex>
      <v-flex xs1 v-show="hasNextPage">
        <v-btn
          flat
          icon
          @click="nextPage()"
        >
          <v-icon>fa-chevron-right</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout v-if="addLED" row wrap justify-center class="mt-1">
      <v-btn
        round
        color="secondary"
        @click="doAddLED(light)"
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
      },
      maxVisible: {
        type: Number
      }
    },
    data: () => ({
      page: 0
    }),
    computed: {
      LEDs () {
        return (this.light && this.light.LEDs) || []
      },
      hasNextPage () {
        return (this.pageOffset + this.pageLimit) < this.LEDs.length
      },
      hasPreviousPage () {
        return (this.page > 0)
      },
      pageLimit () {
        return this.maxVisible || this.LEDs.length
      },
      pageOffset () {
        return (this.page * this.pageLimit)
      }
    },
    methods: {
      doAddLED (light, address = null) {
        if (this.addLED) {
          this.addLED(light, address).then(light => {
            // it should always be on the last page after adding new address
            if (address === null && this.hasNextPage) {
              this.lastPage()
            }
          })
        }
      },
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
      firstPage () {
        this.page = 0
      },
      laKey (light, address) {
        return `${light.id}.${address}`
      },
      laiKey (light, address, index) {
        return `${light.id}.${address}.${index}`
      },
      lastPage () {
        while (this.hasNextPage) {
          this.page++
        }
      },
      nextPage () {
        if (this.hasNextPage) {
          this.page++
        }
      },
      previousPage () {
        if (this.hasPreviousPage) {
          this.page--
        }
      },
      offsetAddress (value, external = false) {
        return (this.pageOffset + value + (external ? this.addressOffset : 0))
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

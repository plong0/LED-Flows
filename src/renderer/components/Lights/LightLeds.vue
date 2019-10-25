<template>
  <div>
    <span class="body-2">LEDs</span> <span class="caption font-weight-light">( {{pageCount ? page + 1 : 0}} / {{pageCount}} )</span>
    <v-layout row justify-space-between>
      <v-flex xs1>
        <v-btn class="ma-0 mt-1"
          flat
          icon
          :disabled="!hasPreviousPage"
          @click="gotoPreviousPage()"
        >
          <v-icon>fa-caret-left</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs9>
        <v-slide-x-transition leave-absolute>
          <v-layout row wrap class="led-list" :style="{minHeight: pageMinHeight}" :key="pageKey">
            <v-flex
              xs2
              v-for="(address, addressIndex) in limitBy(LEDs, pageLimit, pageOffset)"
              :key="lightAddressKey(light, offsetAddress(addressIndex))"
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
                        :color="address.LEDs.length ? 'success' : 'error'"
                        :value="address.LEDs.length !== 1"
                      >
                        <span slot="badge">{{address.LEDs.length}}</span>
                        {{offsetAddress(addressIndex, true)}}
                      </v-badge>
                    </v-btn>
                  </v-slide-y-reverse-transition>
                  <v-scroll-y-transition>
                    <v-layout column wrap align-content-start class="extra-leds elevation-2" :style="extraLedsStyle(address.LEDs)" v-if="hover">
                      <v-flex
                        v-for="(LED, index) in address.LEDs"
                        :key="lightAddressIndexKey(light, offsetAddress(addressIndex), index)"
                      >
                        <v-tooltip
                          right
                          open-delay="250"
                          close-delay="1000"
                          >
                          <v-btn
                            slot="activator"
                            small
                            icon
                            color="accent"
                          >
                            {{offsetAddress(addressIndex)}}
                          </v-btn>
                          <led-details :led="LED" :address="offsetAddress(addressIndex, true)" :local-address="offsetAddress(addressIndex)" :address-index="address.LEDs.length > 1 ? index : null" min-width="164px"></led-details>
                        </v-tooltip>
                      </v-flex>
                      <v-flex>
                        <v-tooltip
                        right
                        open-delay="1000"
                        v-if="addLED"
                        >
                          <v-btn
                            slot="activator"
                            small
                            icon
                            color="secondary"
                            @click="addLED(light, offsetAddress(addressIndex))"
                          >
                            <v-icon small>fa-plus</v-icon>
                          </v-btn>
                          <span>Add a parallel LED</span><br/>
                          <span class="caption font-italic">(shared address, physically unique)</span>
                        </v-tooltip>
                      </v-flex>
                    </v-layout>
                  </v-scroll-y-transition>
                </div>
              </v-hover>
            </v-flex>
          </v-layout>
        </v-slide-x-transition>
      </v-flex>
      <v-flex xs1>
        <v-btn class="ma-0 mt-1"
          flat
          icon
          :disabled="!hasNextPage"
          @click="gotoNextPage()"
        >
          <v-icon>fa-caret-right</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout v-if="addLED" row wrap justify-center class="add-led mt-1">
      <compass v-model="compass" :rounding="{ distance: true, angle: 1 }" :manual-controls="true" :shrink-point="false" :reference-points="compassReferencePoints" :relative-reference-points="(angleMode === 'relative')">
        <template v-slot:compass-controls>
          <SelectSegment v-model="addToStart" width="64px" height="64px" class="add-position">
            <template v-slot:tooltip-left>
              Add to start
            </template>
            <template v-slot:tooltip-right>
              Add to end
            </template>
          </SelectSegment>
          <SelectAngleMode v-model="angleMode" width="36px" height="36px" class="angle-mode"></SelectAngleMode>
        </template>
      </compass>
      <v-btn
        round
        color="secondary"
        @click="addLED(light, null, addLocation, addToStart)"
      >
        <v-icon left>fa-plus</v-icon>
        Add LED
      </v-btn>
    </v-layout>
  </div>
</template>

<script>
  import LedDetails from './LedDetails';
  import Compass from '@/components/Geometry/Compass';
  import SelectSegment from '@/components/Geometry/SelectSegment';
  import SelectAngleMode from '@/components/Geometry/SelectAngleMode';

  export default {
    components: { LedDetails, Compass, SelectSegment, SelectAngleMode },
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
          return (light && light.hasOwnProperty('id') && Array.isArray(light.LEDs));
        }
      },
      maxVisible: {
        type: Number
      }
    },
    data: () => ({
      page: 0,
      compass: {
        active: false,
        angle: 0,
        distance: 0
      },
      addToStart: false,
      angleMode: 'absolute'
    }),
    computed: {
      addLocation () {
        if (this.compass.distance !== 0) {
          return {
            angle: parseFloat(this.compass.angle),
            distance: parseFloat(this.compass.distance),
            angleMode: this.angleMode
          };
        }
        return null;
      },
      LEDs () {
        return (this.light && this.light.LEDs) || [];
      },
      hasNextPage () {
        return (this.page < this.pageMax);
      },
      hasPreviousPage () {
        return (this.page > 0);
      },
      pageCount () {
        return (this.LEDs.length ? (this.pageMax + 1) : 0);
      },
      pageKey () {
        return `led-page-${this.page}`;
      },
      pageLimit () {
        return (this.maxVisible || this.LEDs.length);
      },
      pageMax () {
        return ((this.pageLimit && this.LEDs.length)
          ? Math.floor((this.LEDs.length - 1) / this.pageLimit)
          : 0
        );
      },
      pageMinHeight () {
        /**
        min-height: 200px;
        min-height: 160px;
        */
        return (this.maxVisible / 6 * 40) + 'px';
      },
      pageOffset () {
        return (this.page * this.pageLimit);
      },
      compassReferencePoints () {
        if (!this.light) {
          return;
        }
        const points = [];
        const pointCount = 6;
        const direction = (this.addToStart ? 1 : -1);
        const start = (this.addToStart ? 0 : -1);
        for (let i = 0; i < pointCount; i++) {
          const point = this.$store.getters['Lights/point'](this.light.id, (start + (i * direction)));
          if (!point || !point.position) {
            break;
          }
          points.push(point.position);
        }
        return points;
      }
    },
    watch: {
      maxVisible () {
        if (this.pageCount && this.page > this.pageMax) {
          this.gotoLastPage();
        }
      }
    },
    created () {
      this.$store.subscribe(this.storeUpdated);
    },
    methods: {
      extraLedsStyle (LEDs) {
        const rows = 6;
        const columns = 3;
        const cellHeight = 40;
        const cellWidth = 44;

        // limit the size of the popup
        let style = {
          maxHeight: (rows * cellHeight) + 'px',
          maxWidth: (columns * cellWidth) + 'px'
        };

        // manually calculate width (https://stackoverflow.com/questions/33891709/when-flexbox-items-wrap-in-column-mode-container-does-not-grow-its-width)
        style.width = (Math.ceil((LEDs.length + 1) / rows) * cellWidth) + 'px';

        // give extra room for scrollbar when it overflows
        if (LEDs.length >= (rows * columns)) {
          style.maxHeight = ((rows * cellHeight) + 20) + 'px';
        }

        return style;
      },
      gotoFirstPage () {
        this.page = 0;
      },
      gotoLastPage () {
        this.page = this.pageMax;
      },
      gotoNextPage () {
        if (this.hasNextPage) {
          this.page++;
        }
      },
      gotoPreviousPage () {
        if (this.hasPreviousPage) {
          this.page--;
        }
      },
      lightAddressKey (light, address) {
        return `address-${light.id}.${address}`;
      },
      lightAddressIndexKey (light, address, index) {
        return `led-${light.id}.${address}.${index}`;
      },
      offsetAddress (value, external = false) {
        return (this.pageOffset + value + (external ? this.addressOffset : 0));
      },
      onLedsAdded (light, address, LEDs) {
        // it should always be on the last page after adding new address
        if (address === (light.LEDs.length - 1) && this.hasNextPage) {
          this.gotoLastPage();
        }
      },
      storeUpdated ({ type, payload }, state) {
        switch (type) {
          case 'Lights/ADD_LEDS':
            // only handle the mutation if it was on our light
            if (payload.light && this.light && payload.light.id === this.light.id) {
              this.onLedsAdded(payload.light, payload.address, payload.LEDs);
            }
            break;
        }
      }
    }
  };
</script>

<style scoped>
  .led-list {
    align-content: flex-start;
  }
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

  .layout.add-led {
    position: relative;
  }
  .layout.add-led .angle-mode {
    position: absolute;
    right: 0;
    bottom: 40px;
  }
  .layout.add-led .add-position {
    position: absolute;
    right: 0;
    bottom: -24px;
  }
  .angle-mode .icon {
    color: var(--theme-secondary);
  }
  .angle-mode .accent--text .icon {
    color: var(--theme-accent);
  }

  >>> .compass > .needle > .point {
    border: 0 none transparent;
    background-color: var(--theme-primary);
    width: 10px;
    height: 10px;
    top: -5px;
    right: -5px;
    opacity: 1;
    border-radius: 50%;
  }
</style>

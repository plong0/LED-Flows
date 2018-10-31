<template>
  <v-container fluid>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm1>
        <v-btn
          icon
          :color="buttonColor('Tool/AddLed')"
          @click="activateTool('AddLed')"
        >
          <v-icon>far fa-dot-circle</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs12 sm10 md8>
        <v-responsive :aspect-ratio="4/3" class="canvas-wrapper">
          <div ref="canvasDummy" class="canvas-dummy"></div>
          <canvas ref="canvas" width="1280" height="960"></canvas>
        </v-responsive>
      </v-flex>
    </v-layout>
    <v-layout wrap row justify-center>
      <v-flex xs12 sm2></v-flex>
      <v-flex xs12 sm9 md7>
        <size-context :size="size">
          <light-summary :light="activeLight" empty-text="It's so beautiful!"></light-summary>
        </size-context>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex';
  import PaperLights from '@/bridge/PaperLights/PaperLights';
  import SizeContext from '@/components/Utils/SizeContext';
  import LightSummary from '@/components/Lights/LightSummary';

  export default {
    name: 'led-map',
    components: { SizeContext, LightSummary },
    data: () => ({
      lightMap: null,
      canvasWidth: 0
    }),
    computed: {
      size () {
        if (this.canvasWidth < 300) {
          return 'xs';
        } else if (this.canvasWidth < 360) {
          return 'sm';
        } else if (this.canvasWidth < 600) {
          return 'md';
        } else if (this.canvasWidth < 900) {
          return 'lg';
        } else if (this.canvasWidth >= 900) {
          return 'xl';
        }
      },
      ...mapGetters({
        activeLight: 'UI/activeLight',
        lights: 'Lights/lights'
      })
    },
    created () {
      this.$store.subscribe(this.storeUpdated);
    },
    mounted () {
      window.addEventListener('resize', this.refreshCanvasSize);
      this.refreshCanvasSize();
      this.$nextTick(this.refreshCanvasSize);
      this.lightMap = new PaperLights({
        canvas: this.$refs.canvas,
        actions: {
          activateLight: this.activateLight,
          addLead: this.addLead,
          addLED: this.addLED,
          addLight: this.addLight,
          deleteLead: this.deleteLead,
          deleteLED: this.deleteLED,
          moveLead: this.moveLead,
          moveLED: this.moveLED,
          transferLeads: this.transferLeads
        },
        theme: {
          'Lead-style-strokeColor': this.$vuetify.theme.primary,
          'LED-style-fillColor': this.$vuetify.theme.secondary,
          'LED-style-strokeColor': '',
          'Light-Line-style-strokeColor': this.$vuetify.theme.primary,
          'Light-Line-style-strokeColor-alpha': 0.3,
          'Light-Line-style-strokeWidth': 4.0
        },
        lights: this.lights
      });
    },
    methods: {
      activateLight (light = null, address = null) {
        if ((light && (!this.activeLight || light.id !== this.activeLight.id)) || (!light && this.activeLight)) {
          this.$store.dispatch('UI/activateLight', light);
        }
      },
      activateTool (name) {
        this.lightMap.activateTool(name);
      },
      addLead (light, address, index, lead) {
        if (lead) {
          if (!light) {
            light = this.activeLight;
          }
          if (light) {
            this.$store.dispatch('Lights/addLead', { light, address, index, lead });
          } else {
            this.addLight().then(light => {
              this.$store.dispatch('Lights/addLead', { light, address, index, lead });
            });
          }
        }
      },
      addLED (light, address, LED, stack = false) {
        if (LED) {
          if (!light) {
            light = this.activeLight;
          }
          if (light) {
            return this.$store.dispatch('Lights/addLED', { light, address, LED, stack });
          } else {
            return this.addLight().then(light => {
              return this.$store.dispatch('Lights/addLED', { light, address, LED, stack });
            });
          }
        }
      },
      addLight () {
        return this.$store.dispatch('Lights/createLight').then(light => {
          this.$store.dispatch('UI/activateLight', light);
          return light;
        });
      },
      buttonColor (name) {
        if (this.isActiveTool(name)) {
          return 'accent';
        }
        return 'secondary';
      },
      deleteLead (light, address, index) {
        this.$store.dispatch('Lights/deleteLead', { light, address, index });
      },
      deleteLED (light, address, index) {
        this.$store.dispatch('Lights/deleteLED', { light, address, index });
      },
      isActiveTool (name) {
        return (name.startsWith('Tool') && this.lightMap && this.lightMap.activeTool === name.substr(5));
      },
      moveLead (light, address, index, delta) {
        this.$store.dispatch('Lights/moveLead', { light, address, index, delta });
      },
      moveLED (light, address, index, delta) {
        this.$store.dispatch('Lights/moveLED', { light, address, index, delta });
      },
      onAddressesShifted (light, from, amount) {
        this.lightMap.onAddressesShifted(light, from, amount);
      },
      onLedsAdded (light, address, LEDs) {
        this.lightMap.onLedsAdded(light, address, LEDs);
      },
      onLeadsAdded (light, address, index, leads) {
        this.lightMap.onLeadsAdded(light, address, index, leads);
      },
      onLeadDeleted (light, address, index) {
        this.lightMap.onLeadDeleted(light, address, index);
      },
      onLedDeleted (light, address, index) {
        this.lightMap.onLedDeleted(light, address, index);
      },
      onLeadMoved (light, address, index, position) {
        this.lightMap.onLeadMoved(light, address, index, position);
      },
      onLedMoved (light, address, index, position) {
        this.lightMap.onLedMoved(light, address, index, position);
      },
      onLeadsTransferred (light, from, to, start, count, insert) {
        this.lightMap.onLeadsTransferred(light, from, to, start, count, insert);
      },
      onLightActivated (light) {
        this.lightMap.onLightActivated(light);
      },
      refreshCanvasSize () {
        if (this.$refs.canvasDummy) {
          const width = this.$refs.canvasDummy.offsetWidth;
          const height = this.$refs.canvasDummy.offsetHeight;
          if (this.lightMap) {
            this.lightMap.resizeCanvas(width, height);
          }
          this.canvasWidth = width;
        }
      },
      storeUpdated ({ type, payload }, state) {
        switch (type) {
          case 'Lights/ADD_LEADS':
            this.onLeadsAdded(payload.light, payload.address, payload.index, payload.leads);
            break;
          case 'Lights/ADD_LEDS':
            this.onLedsAdded(payload.light, payload.address, payload.LEDs);
            break;
          case 'Lights/DELETE_LEAD':
            this.onLeadDeleted(payload.light, payload.address, payload.index);
            break;
          case 'Lights/DELETE_LED':
            this.onLedDeleted(payload.light, payload.address, payload.index);
            break;
          case 'Lights/MOVE_LEAD':
            this.onLeadMoved(payload.light, payload.address, payload.index, payload.point);
            break;
          case 'Lights/MOVE_LED':
            this.onLedMoved(payload.light, payload.address, payload.index, payload.point);
            break;
          case 'Lights/SHIFT_ADDRESSES':
            this.onAddressesShifted(payload.light, payload.from, payload.amount);
            break;
          case 'Lights/TRANSFER_LEADS':
            this.onLeadsTransferred(payload.light, payload.from, payload.to, payload.start, payload.count, payload.insert);
            break;
          case 'UI/ACTIVATE_LIGHT':
            this.onLightActivated(payload);
            break;
        }
      },
      transferLeads (light, from, to, start, count, insert) {
        if (!light) {
          light = this.activeLight;
        }
        if (light) {
          this.$store.dispatch('Lights/transferLeads', { light, from, to, start, count, insert });
        }
      }
    }
  };
</script>

<style scoped>
  .canvas-wrapper {
    position: relative;
    border: 1px solid var(--theme-primary);
  }
  .canvas-dummy {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;
    visibility: hidden;
  }
  canvas {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    display: block;
  }
</style>

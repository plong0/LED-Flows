<template>
  <div class="compass-wrapper">
    <div class="compass" @click="mouseClicked" @mousemove="mouseMoved">
      <div ref="needle" class="needle">
        <div ref="point" class="point"></div>
      </div>
      <div ref="anchor" class="anchor"></div>
    </div>
    <div v-if="hasControls" class="controls">
      <input v-if="controlActive" type="checkbox" v-model="active" @change="setActive(active)" class="control-active" />
      <input v-if="controlDistance" type="number" v-model="distance" @input="setDistance(distance)" class="control-distance" />
      <span v-if="controlDistance && controlAngle">@</span>
      <input v-if="controlAngle" type="number" v-model="angle" @input="setAngle(angle)" class="control-angle" />
      <span v-if="controlAngle">&deg;</span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      manualControls: {
        type: [Boolean, Object],
        default: true
      },
      rounding: {
        type: [Boolean, Number, Object],
        default: true
      },
      shrinkPoint: {
        type: Boolean,
        default: true
      },
      value: {
        // provided by v-model
        type: Object
      }
    },
    computed: {
      controlActive () {
        return (this.manualControls === true || (typeof this.manualControls === 'object' && this.manualControls['active'] === true));
      },
      controlAngle () {
        return (this.manualControls === true || (typeof this.manualControls === 'object' && this.manualControls['angle'] === true));
      },
      controlDistance () {
        return (this.manualControls === true || (typeof this.manualControls === 'object' && this.manualControls['distance'] === true));
      },
      hasControls () {
        return (this.controlActive || this.controlAngle || this.controlDistance);
      },
      roundingAngle () {
        return (typeof this.rounding === 'object' && this.rounding.hasOwnProperty('angle'))
          ? this.rounding.angle
          : this.rounding;
      },
      roundingDistance () {
        return (typeof this.rounding === 'object' && this.rounding.hasOwnProperty('distance'))
          ? this.rounding.distance
          : this.rounding;
      }
    },
    data: () => ({
      active: false,
      angle: -90,
      distance: 0,
      defaultPointWidth: 0
    }),
    created () {
      // initialize local data to given value prop (aka v-model)
      if (this.value) {
        if (this.value.hasOwnProperty('active')) {
          this.active = this.value.active;
        }
        if (this.value.hasOwnProperty('angle')) {
          this.angle = this.value.angle;
        }
        if (this.value.hasOwnProperty('distance')) {
          this.distance = this.value.distance;
        }
      }
    },
    mounted () {
      // read the initial rendered width of the point
      this.defaultPointWidth = this.$refs.point.offsetWidth;
      // call all setters so dynamic DOM styles are synchronized with model
      this.setActive(this.active);
      this.setAngle(this.angle);
      this.setDistance(this.distance);
    },
    methods: {
      fireEvent (type, detail) {
        this.$emit('input', {
          active: this.active,
          angle: this.angle,
          distance: this.distance
        });
      },
      roundValue (value, rounding) {
        if (rounding === true) {
          // round to nearest integer
          return Math.round(value);
        } else if (Number.isInteger(rounding)) {
          // round to fixed number of decimal places
          // source: http://www.jacklmoore.com/notes/rounding-in-javascript/
          return Number(Math.round(`${value}e${rounding}`) + `e-${rounding}`);
        }
        // no rounding, return value as is
        return value;
      },
      setActive (active) {
        this.active = active;
        this.fireEvent('compassActive', { active });
      },
      setAngle (angle) {
        angle = this.roundValue(angle, this.roundingAngle);
        this.angle = angle;
        this.$refs.needle.style.transform = `translateY(-50%) rotateZ(${this.angle}deg)`;
        this.fireEvent('compassAngle', { angle });
      },
      setDistance (distance) {
        distance = this.roundValue(distance, this.roundingDistance);
        if (distance < 0) {
          distance = 0;
        }
        this.distance = distance;
        if (this.shrinkPoint) {
          if (distance < this.defaultPointWidth) {
            this.$refs.needle.style.width = '0px';
            // shrink the point if needed
            this.$refs.point.style.borderLeftWidth = `${this.distance}px`;
            this.$refs.point.style.right = `${-this.distance}px`;
          } else {
            this.$refs.needle.style.width = `${this.distance - this.defaultPointWidth}px`;
            // unshrink the point if distance is great enough
            this.$refs.point.style.borderLeftWidth = `${this.defaultPointWidth}px`;
            this.$refs.point.style.right = `${-this.defaultPointWidth}px`;
          }
        } else {
          this.$refs.needle.style.width = `${this.distance}px`;
        }
        this.fireEvent('compassDistance', { distance });
      },
      calculateAngle (p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      },
      calculateDistance (p1, p2) {
        // shoutouts to the OG Pythagoras!
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
      },
      getAnchorPoint () {
        var bounds = this.$refs.anchor.getBoundingClientRect();
        return {
          x: bounds.left + bounds.width / 2.0,
          y: bounds.top + bounds.height / 2.0
        };
      },
      mouseClicked (event) {
        this.setActive(!this.active);
      },
      mouseMoved (event) {
        if (!this.active) {
          return;
        }
        var anchor = this.getAnchorPoint();
        var point = {
          x: event.clientX,
          y: event.clientY
        };
        this.setDistance(this.calculateDistance(anchor, point));
        this.setAngle(this.calculateAngle(anchor, point));
        this.fireEvent('compassChanged', {
          active: this.active,
          angle: this.angle,
          distance: this.distance
        });
      }
    }
  };
</script>

<style scoped>
.compass {
  display: block;
  position: relative;
  width: 75px;
  height: 75px;
  border: 1px solid var(--theme-secondary);
  border-radius: 50%;
}
.anchor,
.needle,
.point {
  display: block;
  position: absolute;
  opacity: 0.85;
}
.anchor,
.needle {
  left: 50%; /* anchor x */
  top: 50%; /* anchor y */
}
.anchor {
  width: 9px;
  height: 9px;
  background-color: var(--theme-secondary);
  border: 1px solid var(--theme-secondary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.needle {
  border-top: 1px solid var(--theme-secondary);
  transform-origin: 0 50%;
  transform: translateY(-50%) rotateZ(0);
}
.point {
  top: -7px;
  right: -15px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 15px solid var(--theme-secondary);
  width: 0px;
  height: 0px;
}
</style>

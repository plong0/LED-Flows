<template>
  <div class="compass-wrapper">
    <div class="compass-field">
      <div ref="compass" class="compass" @click="mouseClicked" @mousemove="mouseMoved">
        <div ref="needle" class="needle" :style="renderCompass.needle">
          <div ref="point" class="point" :style="renderCompass.point"></div>
        </div>
        <div ref="anchor" class="anchor"></div>
        <div v-if="hasReference" class="reference">
          <div v-if="hasReferenceLines" class="reference-lines">
            <span v-for="line in renderReferenceLines" class="reference-line" :style="{ width: `${line.length}px`, transform: `translateY(-50%) rotateZ(${line.angle}deg)` }"></span>
          </div>
          <div v-if="hasReferenceRings" class="reference-rings">
            <span v-for="ring in renderReferenceRings" class="reference-ring" :style="{ 'width': ring.width+'px', 'height': ring.height+'px' }"></span>
          </div>
          <div v-if="hasReferencePoints" class="reference-points">
            <span v-for="point in renderReferencePoints" class="reference-point" :style="{ 'top': point.y+'px', 'left': point.x+'px' }"></span>
          </div>
        </div>
      </div>
      <v-tooltip left open-delay="500" close-delay="250">
        <template v-slot:activator="{ on }">
          <v-switch v-on="on" v-if="controlActive" v-model="active" @change="setActive(active)" class="control-active" color="secondary"></v-switch>
        </template>
        Activate Compass
      </v-tooltip>
      <div class="compass-info">
        <Coordinates :x="referenceScale.x" :y="referenceScale.y" :precision="2" class="reference-scale"></Coordinates>
      </div>
      <slot class="compass-controls" name="compass-controls"></slot>
    </div>
    <div v-if="controlsVector" class="controls controls-vector">
      <v-text-field v-if="controlDistance" v-model="distance" @input="setDistance(distance)" label="Distance" prepend-icon="fas fa-ruler-horizontal fa-lg"></v-text-field>
      <v-text-field v-if="controlAngle" v-model="angle" @input="setAngle(angle)" label="Angle" prepend-icon="fas fa-drafting-compass fa-lg">
        <template v-slot:append>&deg;</template>
      </v-text-field>
    </div>
  </div>
</template>

<script>
  import Geo from '@/utils/Geo';
  import Coordinates from '@/components/Geometry/Coordinates';

  export default {
    components: { Coordinates },
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
      },
      referenceLines: {
        type: [Boolean, Array],
        default: true
      },
      referenceRings: {
        type: [Boolean, Number],
        default: true
      },
      referencePoints: {
        type: Array,
        validator: function (value) {
          if (!value || !Array.isArray(value)) {
            return false;
          }
          for (let check of value) {
            if (!Geo.isPoint(check)) {
              return false;
            }
          }
          return true;
        }
      },
      relativeReferencePoints: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      compassSize () {
        return ((this.isMounted && this.$refs.compass) ? this.$refs.compass.offsetWidth : 0);
      },
      controlActive () {
        return (this.manualControls === true || (typeof this.manualControls === 'object' && this.manualControls['active'] === true));
      },
      controlAngle () {
        return (this.manualControls === true || (typeof this.manualControls === 'object' && this.manualControls['angle'] === true));
      },
      controlDistance () {
        return (this.manualControls === true || (typeof this.manualControls === 'object' && this.manualControls['distance'] === true));
      },
      controlsVector () {
        return (this.controlAngle || this.controlDistance);
      },
      hasReference () {
        return (this.hasReferencePoints);
      },
      hasReferenceLines () {
        return (this.referenceLines === true || (Array.isArray(this.referenceLines) && this.referenceLines.length));
      },
      hasReferenceRings () {
        return (this.hasReferencePoints && ((this.referenceRings === true && this.referencePoints.length > 1) || (!isNaN(Number(this.referenceRings)) && this.referencePoints.length > this.referenceRings)));
      },
      hasReferencePoints () {
        return (this.referencePoints && this.referencePoints.length);
      },
      referenceScale () {
        if (this.hasReferencePoints) {
          if (this.referencePoints.length > 1) {
            const cr = this.compassSize / 2.0;
            const p0 = this.referencePoints[0];
            const p1 = this.referencePoints[1];
            const d1 = Geo.calculateDistance(p0, p1);
            const scale = cr / 2.0 / d1;
            return {
              x: scale,
              y: scale
            };
          }
        }
        return {
          x: 1.0,
          y: 1.0
        };
      },
      relativeAngle () {
        if (this.relativeReferencePoints && this.hasReferencePoints && this.referencePoints.length > 1) {
          const p0 = this.referencePoints[0];
          const p1 = this.referencePoints[1];
          const angle = Geo.calculateAngle(p1, p0);
          return angle;
        }
        return 0;
      },
      renderCompass () {
        const style = {
          needle: {},
          point: {}
        };
        const renderAngle = Number(this.angle) + Number(this.relativeAngle);
        // TODO: it would be better to scale the vector by [scale.x, scale.y]
        const renderDistance = Number(this.distance) * Number(this.referenceScale.x);
        style.needle.transform = `translateY(-50%) rotateZ(${renderAngle}deg)`;
        if (this.shrinkPoint) {
          if (renderDistance < this.defaultPointWidth) {
            style.needle.width = '0px';
            style.needle.width = '0px';
            // shrink the point if needed
            style.point.borderLeftWidth = `${renderDistance}px`;
            style.point.right = `${-renderDistance}px`;
          } else {
            style.needle.width = `${renderDistance - this.defaultPointWidth}px`;
            // unshrink the point if distance is great enough
            style.point.borderLeftWidth = `${this.defaultPointWidth}px`;
            style.point.right = `${-this.defaultPointWidth}px`;
          }
        } else {
          style.needle.width = `${renderDistance}px`;
        }
        return style;
      },
      renderReferenceLines () {
        const renderLines = [];
        const angle = this.relativeAngle;
        const length = this.compassSize / 2.0;
        renderLines.push({
          length: length,
          angle: angle
        });
        return renderLines;
      },
      renderReferencePoints () {
        const renderPoints = [];
        if (this.hasReferencePoints) {
          if (this.referencePoints.length > 1) {
            const cr = this.compassSize / 2.0;
            const scale = this.referenceScale;
            let rp0 = {
              x: cr,
              y: cr
            };
            renderPoints.push(rp0);
            for (let i = 0; i < this.referencePoints.length - 1; i++) {
              let p0 = this.referencePoints[i];
              let p1 = this.referencePoints[i + 1];
              let rp1 = {
                x: rp0.x + (p1.x - p0.x) * scale.x,
                y: rp0.y + (p1.y - p0.y) * scale.y
              };
              renderPoints.push(rp1);
              rp0 = rp1;
            }
          }
        }
        return renderPoints;
      },
      renderReferenceRings () {
        const renderRings = [];
        if (this.hasReferencePoints) {
          if (this.referencePoints.length > 1) {
            const cr = this.compassSize / 2.0;
            renderRings.push({
              width: cr,
              height: cr
            });
          }
        }
        return renderRings;
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
      defaultPointWidth: 0,
      isMounted: false
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
      this.isMounted = true;
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
      roundNumber (value, rounding) {
        return Geo.round(value, rounding);
      },
      setActive (active) {
        this.active = active;
        this.fireEvent('compassActive', { active });
      },
      setAngle (angle) {
        angle = Geo.round(angle, this.roundingAngle);
        this.angle = angle;
        this.fireEvent('compassAngle', { angle });
      },
      setDistance (distance) {
        distance = Geo.round(distance, this.roundingDistance);
        if (distance < 0) {
          distance = 0;
        }
        this.distance = distance;
        this.fireEvent('compassDistance', { distance });
      },
      getAnchorPoint () {
        const anchor = {
          x: 0,
          y: 0
        };
        if (this.isMounted) {
          var bounds = this.$refs.anchor.getBoundingClientRect();
          anchor.x = (bounds.left + bounds.width / 2.0);
          anchor.y = (bounds.top + bounds.height / 2.0);
        }
        return anchor;
      },
      mouseClicked (event) {
        this.setActive(!this.active);
      },
      mouseMoved (event) {
        if (!this.active) {
          return;
        }
        const anchor = this.getAnchorPoint();
        const origin = { x: 0, y: 0 };
        const scale = this.referenceScale;
        const point = {
          x: (event.clientX - anchor.x) / scale.x,
          y: (event.clientY - anchor.y) / scale.y
        };
        this.setDistance(Geo.calculateDistance(point, origin));
        this.setAngle(Geo.calculateAngle(origin, point) - this.relativeAngle);
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
.compass-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.compass-field {
  position: relative;
  padding: 0rem 5rem;
  margin-bottom: 1.5rem;
}
.compass-field .v-input {
  margin: 0;
}
.compass-field .control-active {
  position: absolute;
  top: 0;
  left: 75%;
}
.compass-info {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 0.5em 1.0em;
  opacity: 0.85;
  font-size: 0.9em;
}
.controls.controls-vector {
  display: flex;
  justify-content: center;
}
.controls-vector > .v-text-field {
  flex: 0 1 8rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
.compass {
  display: block;
  position: relative;
  z-index: 10;
  width: 150px;
  height: 150px;
  border: 1px solid var(--theme-secondary);
  border-radius: 50%;
}
.reference,
.reference-points,
.reference-rings,
.reference-lines {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.reference {
  opacity: 0.5;
  z-index: 5;
}
.reference-lines {
  z-index: 6;
}
.reference-rings {
  z-index: 7;
}
.reference-points {
  z-index: 8;
}
.anchor,
.needle,
.point {
  display: block;
  position: absolute;
  opacity: 0.85;
  z-index: 10;
}
.anchor,
.needle,
.reference-line {
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
.needle,
.reference-line {
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
.reference-line,
.reference-ring,
.reference-point {
  display: block;
  position: absolute;
}
.reference-ring,
.reference-point {
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.reference-line {
}
.reference-ring {
  /*
  background-color: var(--theme-secondary);
  opacity: 0.25;
  */
  top: 50%;
  left: 50%;
  border: 1px solid var(--theme-secondary);
}
.reference-point {
  width: 10px;
  height: 10px;
  background-color: var(--theme-secondary);
}
</style>

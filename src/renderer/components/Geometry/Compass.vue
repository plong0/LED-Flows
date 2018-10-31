<template>
  <div class="compass" @click="mouseClicked" @mousemove="mouseMoved">
    <div ref="needle" class="needle">
      <div class="point"></div>
    </div>
    <div ref="anchor" class="anchor"></div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      active: false,
      angle: -90,
      distance: 0
    }),
    methods: {
      fireEvent (type, detail) {
        // DOM.compass.dispatchEvent(new CustomEvent(type, { detail: detail }));
        // console.log(`FIRE EVENT [${type}] => `, detail);
      },
      setActive (active) {
        this.active = active;
        this.fireEvent('compassActive', { active });
      },
      setAngle (angle) {
        this.angle = angle;
        this.$refs.needle.style.transform = `translateY(-50%) rotateZ(${this.angle}deg)`;
        this.fireEvent('compassAngle', { angle });
      },
      setDistance (distance) {
        this.distance = distance;
        this.$refs.needle.style.width = `${(this.distance - 15)}px`;
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
  width: 150px;
  height: 150px;
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

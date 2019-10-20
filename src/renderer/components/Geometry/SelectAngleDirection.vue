<template>
  <div :class="`select-angle-direction active-${value}`">
    <v-tooltip top open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <a v-on="on" @click="setValue(-1)" :class="{ 'target': true, 'target-ccw': true, 'target-active': isValue(-1) }" :style="{ width, height, fontSize: height }">
          <i style="{ width, height }" class="icon fas fa-undo"></i>
          <i style="{ width, height }" class="icon fas fa-undo overlay"></i>
        </a>
      </template>
      <slot name="tooltip-ccw">Counter clockwise</slot>
    </v-tooltip>
    <v-tooltip top open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <a v-on="on" @click="setValue(1)" :class="{ 'target': true, 'target-cw': true, 'target-active': isValue(1) }" :style="{ width, height, fontSize: height }">
          <i style="{ width, height }" class="icon fas fa-undo fa-flip-horizontal"></i>
          <i style="{ width, height }" class="icon fas fa-undo fa-flip-horizontal overlay"></i>
        </a>
      </template>
      <slot name="tooltip-cw">Clockwise</slot>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: -1,
      validator: function (value) {
        return (value === -1 || value === 1);
      }
    },
    width: {
      type: String,
      default: '18px'
    },
    height: {
      type: String,
      default: '18px'
    }
  },
  methods: {
    isValue (value) {
      return (this.value === value);
    },
    setValue (value) {
      this.$emit('input', value);
    }
  }
};
</script>

<style scoped>
.target {
  position: relative;
  display: inline-block;
  color: var(--theme-secondary);
  text-align: center;
}
.target .icon {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.target .overlay {
  color: var(--theme-accent);
  opacity: 0;
  transition: opacity 0.25s ease-in;
}
.target:not(.target-active):hover .overlay {
  opacity: 0.5;
}
.target.target-active .overlay {
  opacity: 1;
}
</style>

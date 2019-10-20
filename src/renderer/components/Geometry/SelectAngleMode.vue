<template>
  <div :class="`select-angle-mode active-${value}`">
    <v-tooltip left open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <a v-on="on" @click="setValue('relative')" :class="{ 'target': true, 'target-relative': true, 'target-active': isValue('relative') }" :style="{ width, height }">
          <IconAngleModeRelative :width="width" :height="height"></IconAngleModeRelative>
          <IconAngleModeRelative :width="width" :height="height" class="overlay"></IconAngleModeRelative>
        </a>
      </template>
      <slot name="tooltip-relative">Relative Angle</slot>
    </v-tooltip>
    <v-tooltip left open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <a v-on="on" @click="setValue('absolute')" :class="{ 'target': true, 'target-absolute': true, 'target-active': isValue('absolute') }" :style="{ width, height }">
          <IconAngleModeAbsolute :width="width" :height="height"></IconAngleModeAbsolute>
          <IconAngleModeAbsolute :width="width" :height="height" class="overlay"></IconAngleModeAbsolute>
        </a>
      </template>
      <slot name="tooltip-absolute">Absolute Angle</slot>
    </v-tooltip>
  </div>
</template>

<script>
import IconAngleModeAbsolute from '@/components/Icons/IconAngleModeAbsolute';
import IconAngleModeRelative from '@/components/Icons/IconAngleModeRelative';
export default {
  components: { IconAngleModeAbsolute, IconAngleModeRelative },
  props: {
    value: {
      type: String,
      default: 'absolute',
      validator: function (value) {
        return (['absolute', 'relative'].indexOf(value) !== -1);
      }
    },
    width: {
      type: String,
      default: '24px'
    },
    height: {
      type: String,
      default: '24px'
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
  display: block;
  color: var(--theme-secondary);
}
.target .overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
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

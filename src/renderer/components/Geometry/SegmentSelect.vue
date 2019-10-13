<template>
  <div :style="{ width, height }" :class="{ 'segment-select': true, 'active-left': activeLeft, 'active-right': activeRight }">
    <v-tooltip left :disabled="activeLeft" open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <div v-on="on" class="target target-left" @click="setValue(Number.isInteger(value) ? 0 : true)"></div>
      </template>
      <slot name="tooltip-left"></slot>
    </v-tooltip>
    <v-tooltip right :disabled="activeRight" open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <div v-on="on" class="target target-right" @click="setValue(Number.isInteger(value) ? 1 : false)"></div>
      </template>
      <slot name="tooltip-right"></slot>
    </v-tooltip>
    <IconSegment :width="width" :height="height"></IconSegment>
    <IconSegmentActiveLeft :width="width" :height="height"></IconSegmentActiveLeft>
    <IconSegmentActiveRight :width="width" :height="height"></IconSegmentActiveRight>
  </div>
</template>

<script>
  import IconSegment from '@/components/Icons/IconSegment';
  import IconSegmentActiveLeft from '@/components/Icons/IconSegmentActiveLeft';
  import IconSegmentActiveRight from '@/components/Icons/IconSegmentActiveRight';
  export default {
    components: { IconSegment, IconSegmentActiveLeft, IconSegmentActiveRight },
    props: {
      value: {
        type: [Number, Boolean],
        default: false
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
    computed: {
      activeLeft () {
        return (this.value === 0 || this.value === true);
      },
      activeRight () {
        return (this.value === 1 || this.value === false);
      }
    },
    methods: {
      setValue (value) {
        this.$emit('input', value);
      }
    }
  };
</script>

<style scoped>
  .segment-select {
    position: relative;
  }
  .icon {
    color: var(--theme-secondary);
    transition: opacity 0.25s ease-in;
  }
  .icon-segment-active {
    color: var(--theme-accent);
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
  }
  .target {
    cursor: pointer;
    position: absolute;
    z-index: 5;
    top: 25%;
    bottom: 25%;
    width: 50%;
  }
  .target-left {
    left: 0;
  }
  .segment-select:not(.active-left) .target-left:hover ~ .icon-segment-active-left {
    opacity: 0.5;
  }
  .target-left:hover ~ .icon-segment-active-right {
    opacity: 0;
  }
  .target-right {
    right: 0;
  }
  .segment-select:not(.active-right) .target-right:hover ~ .icon-segment-active-right {
    opacity: 0.5;
  }
  .target-right:hover ~ .icon-segment-active-left {
    opacity: 0;
  }
  .active-left .icon-segment-active-left {
    opacity: 1;
  }
  .active-right .icon-segment-active-right {
    opacity: 1;
  }
</style>

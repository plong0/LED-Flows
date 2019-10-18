<template>
  <div :style="{ width, height }" :class="`select-segment active-${valueString}`">
    <v-tooltip top open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <a v-on="on" @click="setValue(mapValue('left'))" :class="{'target': true, 'target-left': true, 'target-active': isValue('left')}"></a>
      </template>
      <slot name="tooltip-left"></slot>
    </v-tooltip>
    <v-tooltip top open-delay="500" close-delay="250">
      <template v-slot:activator="{ on }">
        <a v-on="on" @click="setValue(mapValue('right'))" :class="{'target': true, 'target-right': true, 'target-active': isValue('right')}"></a>
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
      },
      valueString () {
        if (this.activeLeft) {
          return 'left';
        }
        if (this.activeRight) {
          return 'right';
        }
        return '';
      }
    },
    methods: {
      isValue (value) {
        return (this.value === value || this.valueString === value);
      },
      mapValue (value) {
        if (value === 'left') {
          return (Number.isInteger(value) ? 0 : true);
        } else if (value === 'right') {
          return (Number.isInteger(value) ? 1 : false);
        }
      },
      setValue (value) {
        this.$emit('input', value);
      }
    }
  };
</script>

<style scoped>
  .select-segment {
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
    display: block;
    position: absolute;
    top: 25%;
    bottom: 25%;
    width: 50%;
    z-index: 5;
  }
  .target-left {
    left: 0;
  }
  .target-right {
    right: 0;
  }
  .target-left:not(.target-active):hover ~ .icon-segment-active-left {
    opacity: 0.5;
  }
  .target-right:not(.target-active):hover ~ .icon-segment-active-right {
    opacity: 0.5;
  }
  .target-left.target-active ~ .icon-segment-active-left {
    opacity: 1;
  }
  .target-right.target-active ~ .icon-segment-active-right {
    opacity: 1;
  }  
</style>

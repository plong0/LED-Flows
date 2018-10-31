<template>
  <div :class="className">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      size: {
        type: String
      }
    },
    computed: {
      className () {
        if (['xs', 'sm', 'md', 'lg', 'xl'].includes(this.size)) {
          return `size-context size-context-${this.size}`;
        }
      }
    }
  };
</script>

<style lang="stylus">
$grid-breakpoints := {
  xs: 0
  sm: 600px
  md: 960px
  lg: (1280px - 16px) // Desktop gets a 16dp reduction
  xl: (1920px - 16px) // https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints
}
$display-breakpoints := {
  xs-only: "only screen and (max-width: %s)" % ($grid-breakpoints.sm - 1)
  sm-only: "only screen and (min-width: %s) and (max-width: %s)" % ($grid-breakpoints.sm ($grid-breakpoints.md  - 1))
  sm-and-down: "only screen and (max-width: %s)" % ($grid-breakpoints.md - 1)
  sm-and-up: "only screen and (min-width: %s)" % $grid-breakpoints.sm
  md-only: "only screen and (min-width: %s) and (max-width: %s)" % ($grid-breakpoints.md ($grid-breakpoints.lg  - 1))
  md-and-down: "only screen and (max-width: %s )" % ($grid-breakpoints.lg - 1)
  md-and-up: "only screen and (min-width: %s)" % $grid-breakpoints.md
  lg-only: "only screen and (min-width: %s) and (max-width: %s)" % ($grid-breakpoints.lg ($grid-breakpoints.xl - 1))
  lg-and-down: "only screen and (max-width: (%s - 1))" % $grid-breakpoints.xl
  lg-and-up: "only screen and (min-width: %s)" % $grid-breakpoints.lg
  xl-only: "only screen and (min-width: %s)" % $grid-breakpoints.xl
}
$size-context-prefix = '.size-context.size-context-'
$grid-contexts := {
  xs: $size-context-prefix + join(','+$size-context-prefix, xs sm md lg xl)
  sm: $size-context-prefix + join(','+$size-context-prefix, sm md lg xl)
  md: $size-context-prefix + join(','+$size-context-prefix, md lg xl)
  lg: $size-context-prefix + join(','+$size-context-prefix, lg xl)
  xl: $size-context-prefix + 'xl'
}
$grid-columns := 12
$grid-range := (1..$grid-columns)
$grid-range-0 := (0..$grid-columns)
.size-context
  for $size, $width in $grid-breakpoints
    @media all and (min-width: $width)
      $flex-prefix = '.flex.'+$size
      $flex-order-prefix = '.flex.order-'+$size
      $flex-offset-prefix = '.flex.offset-'+$size

      {$flex-prefix + join(','+$flex-prefix, $grid-range)}
        flex-basis: auto
        flex-grow: 1
        max-width: 100%

      {$flex-order-prefix + join(','+$flex-order-prefix, $grid-range)}
        order: initial

      {$flex-offset-prefix + join(','+$flex-offset-prefix, $grid-range-0)}
        // Offsets can only ever work in row layouts
        margin-left: initial

for $size, $context-selector in $grid-contexts
  .size-context
    .text-{$size}-left
      text-align: inherit !important

    .text-{$size}-center
      text-align: inherit !important

    .text-{$size}-right
      text-align: inherit !important

    .text-{$size}-justify
      text-align: inherit !important

  {$context-selector}
    for n in (1..$grid-columns)
      .flex.{$size}{n}
        flex-basis: (n / $grid-columns * 100)%
        flex-grow: 0
        max-width: (n / $grid-columns * 100)%

      .flex.order-{$size}{n}
        order: n

    for n in (0..$grid-columns)
      .flex.offset-{$size}{n}
        // Offsets can only ever work in row layouts
        margin-left: (n / $grid-columns * 100)%

    .text-{$size}-left
      text-align: left !important

    .text-{$size}-center
      text-align: center !important

    .text-{$size}-right
      text-align: right !important

    .text-{$size}-justify
      text-align: justify !important


.size-context
  for $size, $media_query in $display-breakpoints
    @media $media_query
      .hidden
        &-{$size}
          div&,
          &.v-divider
            display: block !important
          &.v-divider--vertical
            display: inline-flex !important

.size-context-xs
  .hidden-xs-only,
  .hidden-lg-and-down,
  .hidden-md-and-down,
  .hidden-sm-and-down
    display: none !important;
    div&,
    &.v-divider,
    &.v-divider--vertical
      display: none !important;

.size-context-sm
  .hidden-sm-only,
  .hidden-lg-and-down,
  .hidden-md-and-down,
  .hidden-sm-and-down,
  .hidden-sm-and-up
    display: none !important;
    div&,
    &.v-divider,
    &.v-divider--vertical
      display: none !important;

.size-context-md
  .hidden-md-only,
  .hidden-lg-and-down,
  .hidden-md-and-down,
  .hidden-md-and-up,
  .hidden-sm-and-up
    display: none !important;
    div&,
    &.v-divider,
    &.v-divider--vertical
      display: none !important;

.size-context-lg
  .hidden-lg-only,
  .hidden-lg-and-down,
  .hidden-lg-and-up,
  .hidden-md-and-up,
  .hidden-sm-and-up
    display: none !important;
    div&,
    &.v-divider,
    &.v-divider--vertical
      display: none !important;

.size-context-xl
  .hidden-xl-only,
  .hidden-lg-and-up,
  .hidden-md-and-up,
  .hidden-sm-and-up
    display: none !important;
    div&,
    &.v-divider,
    &.v-divider--vertical
      display: none !important;
</style>

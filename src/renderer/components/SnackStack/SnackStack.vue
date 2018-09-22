<template>
  <v-snackbar
    v-model="visible"
    :left="xPosition === 'left'"
    :right="xPosition === 'right'"
    :top="yPosition === 'top'"
    :bottom="yPosition === 'bottom'"
    :multi-line="mode === 'multi-line'"
    :vertical="mode === 'vertical'"
    :color="color"
    :timeout="timeout"
  >
    {{ text }}
    <v-btn
      v-show="dismissable"
      :color="closeColor(color)"
      flat
      @click="visible = false"
    >
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    props: {
      mode: {
        type: String,
        default: '',
        validator: (value) => (
          !value || ['multi-line', 'vertical'].includes(value)
        )
      },
      defaultTimeout: {
        type: Number
      },
      delayNext: {
        type: Number,
        default: 250
      },
      xPosition: {
        type: String,
        default: '',
        validator: (value) => (
          !value || ['left', 'right'].includes(value)
        )
      },
      yPosition: {
        type: String,
        default: '',
        validator: (value) => (
          !value || ['top', 'bottom'].includes(value)
        )
      }
    },
    data: () => ({
      show: true,
      current: null,
      timeout: 0,
      visible: false
    }),
    computed: {
      count () {
        return this.$store.getters['Snacks/count']
      },
      color () {
        return (this.current && (this.current.color || this.current.type))
      },
      dismissable () {
        return (this.current && (this.current.dismissable || !this.current.timeout))
      },
      text () {
        return (this.current && this.current.message)
      }
    },
    watch: {
      visible (value) {
        if (!value && this.current) {
          this.consumeCurrent()
        }
      }
    },
    created () {
      this.$store.subscribe(({ type, payload }, state) => {
        switch (type) {
          case 'Snacks/NEW_SNACK':
            this.nextSnack()
            break
          case 'Snacks/CONSUMED':
            if (payload.snack === this.current) {
              this.resetCurrent()
              setTimeout(() => {
                this.nextSnack()
              }, this.delayNext)
            }
            break
        }
      })
    },
    methods: {
      closeColor (color) {
        return 'grey lighten-2'
      },
      consumeCurrent () {
        if (this.current) {
          this.$store.dispatch('Snacks/consumeSnack', this.current)
        }
      },
      nextSnack () {
        if (this.current) {
          return
        }
        const snack = this.$store.getters['Snacks/nextSnack']
        if (snack) {
          this.current = snack
          this.timeout = (snack.timeout || snack.timeout === 0) ? snack.timeout : this.defaultTimeout
          this.visible = true
        }
      },
      resetCurrent () {
        this.current = null
        this.timeout = 0
        this.visible = false
      }
    }
  }
</script>

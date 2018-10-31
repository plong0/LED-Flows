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
    :timeout="0"
  >
    {{ text }}
    <v-btn
      v-if="!remaining"
      v-show="dismissable"
      :color="closeColor(color)"
      flat
      @click="consumeCurrent()"
    >
      Close
    </v-btn>
    <v-btn
      v-else
      v-show="dismissable"
      :color="closeColor(color)"
      flat
      @click="consumeCurrent(true)"
    >
      Next ({{remaining}} more)
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    data: () => ({
      current: null,
      expiryTimer: null,
      timeout: 0,
      visible: false,
      visibleLock: false
    }),
    computed: {
      count () {
        return this.$store.getters['Snacks/count'];
      },
      color () {
        return (this.current && (this.current.color || this.current.type));
      },
      dismissable () {
        return (this.current && (this.current.dismissable || !this.current.timeout));
      },
      remaining () {
        return (this.count - 1);
      },
      text () {
        return (this.current && this.current.message);
      }
    },
    props: {
      chaining: {
        type: Boolean,
        default: true
      },
      defaultTimeout: {
        type: Number,
        default: 6000
      },
      delayNext: {
        type: Number,
        default: 250
      },
      immediateNext: {
        type: Boolean
      },
      mode: {
        type: String,
        default: '',
        validator: (value) => (
          !value || ['multi-line', 'vertical'].includes(value)
        )
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
    created () {
      this.$store.subscribe(this.snackStoreUpdated);
    },
    methods: {
      closeColor (color) {
        return 'grey lighten-2';
      },
      consumeCurrent (chaining = false) {
        if (this.current) {
          this.$store.dispatch('Snacks/consumeSnack', { snack: this.current, chaining });
        }
      },
      nextSnack () {
        if (this.current) {
          // don't load the next one until current has been consumed
          return;
        }
        const snack = this.$store.getters['Snacks/nextSnack'];
        if (snack) {
          this.current = snack;
          this.timeout = (snack.timeout || snack.timeout === 0) ? snack.timeout : this.defaultTimeout;
          this.visible = true;
          if (this.timeout) {
            // roll our own snackbar timeout to expire without necessarily killing visibility
            this.expiryTimer = setTimeout(() => {
              this.expiryTimer = undefined;
              this.consumeCurrent();
            }, this.timeout);
          }
        }
      },
      resetCurrent () {
        this.current = null;
        this.timeout = 0;
        this.visible = false;
        if (this.expiryTimer) {
          clearTimeout(this.expiryTimer);
          this.expiryTimer = undefined;
        }
      },
      snackStoreUpdated ({ type, payload }, state) {
        switch (type) {
          case 'Snacks/NEW_SNACK':
            // try to load it (nextSnack will ignore if necessary)
            this.nextSnack();
            break;
          case 'Snacks/CONSUMED':
            if (payload.snack === this.current) {
              this.resetCurrent();
              if ((this.chaining && payload.chaining) || this.immediateNext) {
                // if chaining is enabled, proceed immediately to show next
                this.nextSnack();
              } else {
                // no chaining, delay showing the next
                // (even timeout of 0 waits until next tick before refreshing DOM with visible = true)
                setTimeout(() => {
                  this.nextSnack();
                }, this.delayNext);
              }
            }
            break;
        }
      }
    }
  };
</script>

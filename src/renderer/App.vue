<template>
  <div id="app" :style="cssProps">
    <v-app dark>
      <v-navigation-drawer
        temporary
        clipped
        fixed
        :mini-variant="leftDrawerMini"
        v-model="leftDrawerOpen"
        app
      >
        <v-list>
          <v-list-tile :class="{ 'primary--text v-list__tile--active': routeMatches(item.to) }"
            router
            :to="item.to"
            :key="i"
            v-for="(item, i) in menuItems"
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar fixed app clipped-right>
        <v-toolbar-side-icon @click.native.stop="leftDrawerOpen = !leftDrawerOpen"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            :disabled="!managerEnabled"
            :flat="!managerEnabled"
            icon
            color="secondary"
            to="/lights"
            @click.native.capture="toggleRightDrawer(routePath, '/lights')"
          >
            <v-icon>fa-lightbulb</v-icon>
          </v-btn>
          <v-btn
            :disabled="!managerEnabled"
            :flat="!managerEnabled"
            icon
            color="secondary"
            to="/currents"
            @click.native.capture="toggleRightDrawer(routePath, '/currents')"
          >
            <v-icon>fa-ellipsis-h</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-content>
        <v-slide-y-transition mode="out-in">
          <keep-alive include="led-map">
            <router-view></router-view>
          </keep-alive>
        </v-slide-y-transition>
      </v-content>
      <v-navigation-drawer
        v-show="managerEnabled"
        clipped
        fixed
        right
        :temporary="rightDrawerMini"
        :mobile-break-point="rightDrawerBreakPoint"
        v-model="rightDrawerOpen"
        :width="rightDrawerWidth"
        app
      >
        <v-container fluid>
          <v-slide-x-reverse-transition leave-absolute>
            <router-view name="manager"></router-view>
          </v-slide-x-reverse-transition>
        </v-container>
      </v-navigation-drawer>
      <snack-stack></snack-stack>
      <v-footer app>
        <v-spacer></v-spacer>
        <span>&copy; 2018</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  import SnackStack from '@/components/SnackStack/SnackStack'

  export default {
    name: 'led-flows',
    components: { SnackStack },
    data: () => ({
      title: 'LED Flows',
      menuItems: [
        { icon: 'map', title: 'LED Map', to: '/led-map' },
        { icon: 'settings', title: 'Settings', to: '/settings' }
      ],
      leftDrawerOpen: false,
      rightDrawerOpen: true,
      rightDrawerBreakPoint: 0
    }),
    computed: {
      cssProps () {
        return {
          '--theme-primary': this.$vuetify.theme.primary,
          '--theme-secondary': this.$vuetify.theme.secondary,
          '--theme-accent': this.$vuetify.theme.accent
        }
      },
      routePath () {
        return this.$route.path
      },
      managerEnabled () {
        return this.routeHasView('manager')
      },
      leftDrawerMini () {
        return this.$vuetify.breakpoint.smAndDown
      },
      rightDrawerMini () {
        return this.$vuetify.breakpoint.smAndDown
      },
      rightDrawerWidth () {
        if (this.$vuetify.breakpoint.lgAndUp) {
          return 500
        } else if (this.$vuetify.breakpoint.mdAndUp) {
          return 400
        }
        return 300
      }
    },
    methods: {
      routeHasView (view) {
        for (let route of this.$route.matched) {
          if (route.components[view]) {
            return true
          }
        }
        return false
      },
      routeMatches (to) {
        if (this.$route.matched.length) {
          const route = this.$route.matched[this.$route.matched.length - 1]
          return (route.path.startsWith(to))
        }
        return false
      },
      toggleRightDrawer (from, to) {
        if (from === to || !this.rightDrawerOpen) {
          this.rightDrawerOpen = !this.rightDrawerOpen
        }
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
</style>

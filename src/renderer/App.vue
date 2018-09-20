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
          <v-list-tile 
            router
            :to="item.to"
            :key="i"
            v-for="(item, i) in menuItems"
            exact
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
      <v-toolbar fixed app>
        <v-toolbar-side-icon @click.native.stop="leftDrawerOpen = !leftDrawerOpen"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click.native.stop="rightDrawerOpen = !rightDrawerOpen"
        >
          <v-icon>menu</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid>
          <v-slide-y-transition mode="out-in">
            <router-view></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>
      <v-navigation-drawer
        clipped
        fixed
        right
        :mobile-break-point="rightDrawerBreakPoint"
        v-model="rightDrawerOpen"
        app
      >
      </v-navigation-drawer>
      <v-footer app>
        <v-spacer></v-spacer>
        <span>&copy; 2018</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'led-flows',
    data: () => ({
      title: 'LED Flows',
      menuItems: [
        { icon: 'map', title: 'LED Map', to: '/led-map' }
      ],
      leftDrawerOpen: false,
      rightDrawerOpen: true
    }),
    computed: {
      cssProps () {
        return {
          '--theme-primary': this.$vuetify.theme.primary,
          '--theme-secondary': this.$vuetify.theme.secondary,
          '--theme-accent': this.$vuetify.theme.accent
        }
      },
      leftDrawerMini () {
        return this.$vuetify.breakpoint.smAndDown
      },
      rightDrawerBreakPoint () {
        return 0 // 960
      },
      rightDrawerPermanent () {
        return this.$vuetify.breakpoint.lgAndUp
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
</style>

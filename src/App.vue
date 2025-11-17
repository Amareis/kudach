<template>
  <v-app>
    <v-app-bar app>
      <portal-target name="header-icon">
        <v-app-bar-nav-icon v-if="$vuetify.breakpoint.sm" @click="drawer = true" />
      </portal-target>
      <v-row no-gutters>
        <v-col class="d-flex align-center">
          <v-toolbar-title class="selectNone">
            <portal-target name="header-title">Кудач</portal-target>
          </v-toolbar-title>
        </v-col>
        <v-col>
          <portal-target name="header-right" />
        </v-col>
      </v-row>
    </v-app-bar>
    <v-navigation-drawer v-if="$vuetify.breakpoint.sm" app temporary v-model="drawer">
      <nav-list :admin="auth.isAdmin" />
    </v-navigation-drawer>
    <v-content>
      <v-container fluid class="px-0">
        <v-row wrap no-gutters justify="center">
          <v-col v-if="$vuetify.breakpoint.mdAndUp" md="3" :style="{position: 'relative'}">
            <v-layout justify-end class="mx-3" :style="{position: 'absolute', right: 0}">
              <v-card max-width="200px" :style="{position: 'fixed'}">
                <v-navigation-drawer floating permanent>
                  <nav-list :admin="auth.isAdmin" />
                </v-navigation-drawer>
              </v-card>
            </v-layout>
          </v-col>
          <v-col cols="12" sm="10" md="6" lg="5" xl="4">
            <v-row v-if="!loader.loaded || hasMajorUpdate" justify="center"
              ><v-progress-circular indeterminate
            /></v-row>
            <keep-alive v-else include="List">
              <router-view :key="$route.name"></router-view>
            </keep-alive>
          </v-col>
          <v-col v-if="$vuetify.breakpoint.mdAndUp" md="3" :style="{position: 'relative'}">
            <portal-target name="main-right" />
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-bottom-navigation
      v-if="$vuetify.breakpoint.xs && $route.name !== 'details'"
      app
      height="50px"
      grow
    >
      <v-btn text icon :ripple="{center: true}" class="navBtn" :to="{name: 'list'}" exact>
        <v-icon>mdi-calendar</v-icon>
      </v-btn>

      <v-btn text icon :ripple="{center: true}" class="navBtn" :to="{name: 'favorite'}">
        <v-icon>mdi-heart-outline</v-icon>
      </v-btn>

      <v-btn text icon :ripple="{center: true}" class="navBtn" :to="{name: 'rating'}">
        <v-icon>mdi-crown</v-icon>
      </v-btn>

      <v-btn text icon :ripple="{center: true}" class="navBtn" :to="{name: 'profile'}">
        <v-icon>mdi-account</v-icon>
      </v-btn>

      <v-btn
        v-if="auth.isAdmin"
        text
        icon
        :ripple="{center: true}"
        class="navBtn"
        :to="{name: 'checkins'}"
      >
        <v-icon>mdi-pencil-outline</v-icon>
      </v-btn>
    </v-bottom-navigation>

    <v-snackbar :value="updater.hasUpdate" bottom color="info" :timeout="0">
      Есть обновления!
      <v-btn text large @click="updater.applyUpdate"> Применить их </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import {Route} from 'vue-router'
import {Component, Vue, Watch} from 'vue-property-decorator'

import {reload} from '@/plugins/regSw'
import {settings, updater, loader, auth, router} from '@/store'

import NavList from '@/components/NavList.vue'
import BackButton from '@/components/BackButton.vue'

@Component({components: {BackButton, NavList}})
export default class App extends Vue {
  updater = updater
  loader = loader
  auth = auth

  drawer = false

  get hasMajorUpdate() {
    return settings.hasMajorUpdate
  }

  @Watch('hasMajorUpdate')
  onMajorUpdate(major: boolean) {
    if (major) reload()
  }

  get immediateUpdate() {
    return settings.hasMajorUpdate && updater.hasUpdate
  }

  @Watch('immediateUpdate')
  onImmediateUpdate(immediate: boolean) {
    if (immediate) updater.applyUpdate()
  }

  created() {
    settings.load()
  }

  @Watch('$route')
  onRouteChange(cur: Route, old: Route) {
    router.setHasBack(old.name !== null)
  }
}
</script>

<style scoped>
.selectNone {
  user-select: none;
}
.navBtn {
  min-width: 0 !important;
}
.navBtn:hover:before {
  opacity: 0;
}
</style>

<template>
  <v-app>
    <v-app-bar app>
      <template v-if="$route.name === 'list' && !$route.query.date">
        <v-row no-gutters>
          <v-col v-if="$vuetify.breakpoint.smAndUp"
            ><v-toolbar-title class="ktitle">Кудач</v-toolbar-title></v-col
          >
          <v-col>
            <v-row no-gutters :justify="$vuetify.breakpoint.smAndUp ? 'center' : 'start'">
              <v-btn
                outlined
                color="info"
                href="https://vk.com/kuda_ch"
                target="_blank"
                class="pl-3 pr-3"
                >Мы ВКонтакте</v-btn
              >
            </v-row>
          </v-col>
          <v-col>
            <portal-target name="header-right" />
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-app-bar-nav-icon>
          <v-icon large @click="goMain">
            mdi-arrow-left
          </v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title>
          <span v-if="$route.name === 'details'">Событие</span>
          <span v-else>{{ date }}</span>
        </v-toolbar-title>
      </template>
    </v-app-bar>
    <v-content>
      <v-container fluid class="pl-0 pr-0">
        <v-row wrap no-gutters justify="center">
          <v-col v-if="$vuetify.breakpoint.mdAndUp" md="3"> </v-col>
          <v-col cols="12" sm="10" md="6">
            <v-row v-if="hasMajorUpdate" justify="center"
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

    <v-snackbar :value="updater.hasUpdate" bottom color="info" :timeout="0">
      Есть обновления!
      <v-btn text large @click="updater.applyUpdate">
        Применить их
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator'
import {Route} from 'vue-router'
import moment from 'moment'

import {reload} from '@/plugins/regSw'
import {settings, updater} from '@/store'

@Component
export default class App extends Vue {
  fromList = false

  updater = updater

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

  goMain() {
    if (this.fromList) this.$router.go(-1)
    else this.$router.push({name: 'list'})
  }

  get date() {
    let {date} = this.$route.query
    if (!date) return 'скоро'
    let m = moment(date as string)
    if (m.isSame(moment(), 'day')) return 'сегодня'
    if (m.isSame(moment().add(1, 'day'), 'day')) return 'завтра'
    return m.format('D MMM')
  }

  @Watch('$route')
  onRouteChange(cur: Route, old: Route) {
    this.fromList = old.name === 'list'
  }
}
</script>

<style lang="stylus" scoped>
.ktitle
  userSelect none
  overflow visible
  width 0
</style>

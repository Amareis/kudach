<template>
  <v-app>
    <v-app-bar app>
      <template v-if="$route.name === 'list' && (!$route.query.date && !$route.query.kind)">
        <template v-if="$vuetify.breakpoint.smAndUp">
          <v-toolbar-title :style="{userSelect: 'none'}">Кудач</v-toolbar-title>
          <v-spacer />
        </template>
        <v-btn outlined color="info" href="https://vk.com/kuda_ch" target="_blank"
          >Мы ВКонтакте</v-btn
        >
        <template v-if="$vuetify.breakpoint.smAndUp">
          <v-spacer />
          <v-toolbar-title :style="{visibility: 'hidden'}">Кудач</v-toolbar-title>
        </template>
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
      <v-container class="pl-0 pr-0 mb-5">
        <v-layout wrap justify-center>
          <keep-alive include="List">
            <router-view :key="$route.name"></router-view>
          </keep-alive>
        </v-layout>
      </v-container>
    </v-content>

    <v-snackbar v-model="update" bottom color="info" :timeout="0">
      Есть обновления!
      <v-btn text large @click="$root.$emit('reload-sw')">
        Применить их
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator'
import {Route} from 'vue-router'
import moment from 'moment'

@Component
export default class App extends Vue {
  fromList = false
  update = false

  created() {
    this.$root.$on('sw-updated', () => (this.update = true))
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

<style lang="stylus"></style>

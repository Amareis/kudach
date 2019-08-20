<template>
  <v-app>
    <portal-target name="header">
      <v-app-bar app>
        <v-row no-gutters>
          <v-col v-if="$vuetify.breakpoint.smAndUp"
            ><v-toolbar-title class="selectNone">Кудач</v-toolbar-title></v-col
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
      </v-app-bar>
    </portal-target>
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

import {reload} from '@/plugins/regSw'
import {settings, updater} from '@/store'

import BackButton from '@/components/BackButton.vue'

@Component({components: {BackButton}})
export default class App extends Vue {
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
}
</script>

<style lang="stylus" scoped>
.selectNone
  userSelect none
</style>

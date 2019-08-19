<template>
  <v-flex v-if="smallScreens">
    <v-btn
      outlined
      color="success"
      @click="menu = true"
      fixed
      right
      class="pl-3 pr-3"
      :style="{
        top: $vuetify.breakpoint.smAndDown ? '10px' : '14px',
        zIndex: 100,
      }"
      >Календарь</v-btn
    >
    <v-dialog v-model="menu" width="300px">
      <slot :mobile="true" />
    </v-dialog>
  </v-flex>
  <v-layout v-else :style="{position: 'absolute', left: '100%'}" ref="menu" v-resize="setLeft">
    <v-card :style="left ? {position: 'fixed', left, maxWidth: '250px'} : {}" class="ml-3 mr-3">
      <slot :mobile="false" />
    </v-card>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

@Component
export default class SearchWrapper extends Vue {
  menu = false
  left: string | null = null

  public $refs!: {
    menu: Element
  }

  get smallScreens() {
    return this.$vuetify.breakpoint.smAndDown
  }

  setLeft() {
    this.left = this.$refs.menu.getBoundingClientRect().left + 'px'
  }
}
</script>

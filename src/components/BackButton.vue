<template>
  <v-icon large @click="goBack">
    mdi-arrow-left
  </v-icon>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {Route, Location} from 'vue-router'

@Component
export default class BackButton extends Vue {
  @Prop({default: '/', type: [String, Object]}) private readonly default!: string | Location
  hasBack = false

  goBack() {
    if (this.hasBack) this.$router.go(-1)
    else this.$router.push(this.default)
  }

  @Watch('$route')
  onRouteChange(cur: Route, old: Route) {
    this.hasBack = old.name !== null
  }
}
</script>

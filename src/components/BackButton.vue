<template>
  <v-icon large @click="goBack"> mdi-arrow-left </v-icon>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import {Location} from 'vue-router'

import {router} from '@/store'

@Component
export default class BackButton extends Vue {
  @Prop({default: '/', type: [String, Object]}) private readonly default!: string | Location

  goBack() {
    if (router.hasBack) this.$router.go(-1)
    else this.$router.push(this.default)
  }
}
</script>

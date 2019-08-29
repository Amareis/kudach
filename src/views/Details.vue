<template>
  <v-layout column>
    <portal to="header-icon">
      <v-app-bar-nav-icon>
        <back-button />
      </v-app-bar-nav-icon>
    </portal>
    <portal to="header-title">Событие</portal>
    <item-loader :id="id" />
  </v-layout>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import ItemLoader from '@/components/ItemLoader.vue'
import BackButton from '@/components/BackButton.vue'

@Component({
  components: {ItemLoader, BackButton},
})
export default class Details extends Vue {
  @Prop() private readonly id!: string
}
</script>

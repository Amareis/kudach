<template>
  <v-layout column>
    <portal to="header">
      <v-app-bar app>
        <v-app-bar-nav-icon>
          <back-button />
        </v-app-bar-nav-icon>
        <v-toolbar-title>Событие</v-toolbar-title>
      </v-app-bar>
    </portal>
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

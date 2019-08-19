<template>
  <portal v-if="smallScreens" to="header-right">
    <v-row justify="end">
      <v-btn outlined color="success" @click="menu = true" class="pl-3 pr-3">Календарь</v-btn>
    </v-row>
    <v-dialog v-model="menu" width="300px">
      <slot :mobile="true" />
    </v-dialog>
  </portal>
  <div v-else :style="{position: 'absolute', left: '100%'}">
    <v-card :style="{position: 'fixed'}" max-width="250px" class="ml-3 mr-3">
      <slot :mobile="false" />
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

@Component
export default class SearchWrapper extends Vue {
  menu = false

  get smallScreens() {
    return this.$vuetify.breakpoint.smAndDown
  }
}
</script>

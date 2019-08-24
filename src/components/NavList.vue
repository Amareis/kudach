<template>
  <v-list class="py-0" dense>
    <v-list-item link :to="{name: 'list'}" exact>
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-calendar</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>События</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item link :to="{name: 'favorite'}">
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-heart-outline</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Избранное</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item link :to="{name: 'profile'}">
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-account</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Профиль</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item v-if="admin" link :to="{name: 'create'}">
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-pencil-outline</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Админка</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component
export default class NavList extends Vue {
  @Prop({default: false}) private readonly admin!: boolean
}
</script>

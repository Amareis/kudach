<template>
  <v-list dense>
    <v-list-item link :to="{name: 'list'}" exact>
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-calendar</v-icon>
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title>События</v-list-item-title>
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
  </v-list>
</template>

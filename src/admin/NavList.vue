<template>
  <v-list class="py-0" dense>
    <v-list-item :to="{name: 'checkins'}" exact>
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-plus-circle-outline</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Чекины</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item :to="{name: 'promotes'}">
      <v-list-item-icon class="mr-3">
        <v-icon>mdi-fire</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Рекламные посты</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

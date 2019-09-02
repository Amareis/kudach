<template>
  <v-card>
    <v-card-text class="pb-2 black--text"
      >Привет! Это - Кудач. Мы собираем живые события и активных людей. Cобытия - ниже, а люди - в
      <router-link :to="{name: 'rating'}">нашем рейтинге</router-link>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-btn outlined color="info" href="https://vk.com/kuda_ch" target="_blank">Группа ВК</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="success" :to="{name: 'proposals'}">Добавить событие</v-btn>
    </v-card-actions>
  </v-card>
</template>

<template>
  <v-card>
    <v-card-text class="pb-2 black--text"
      ><h3>Привет! Это - Кудач</h3>
      <br />
      1. Находи интересные события ВКонтакте и
      <router-link :to="{name: 'proposals'}">добавляй их к нам</router-link><br />
      2. Посещай события и присылай нам чекины<br />
      3. Возглавляй <router-link :to="{name: 'rating'}">наш рейтинг</router-link> и получай
      призы!<br />
      <br />
      Подробности - в <a href="https://vk.com/kuda_ch" target="_blank">нашей группе ВКонтакте</a>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-btn outlined color="info" href="https://vk.com/kuda_ch" target="_blank">Группа ВК</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="success" :to="{name: 'proposals'}">Добавить событие</v-btn>
    </v-card-actions>
  </v-card>
</template>

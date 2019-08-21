<template>
  <v-layout column>
    <v-card v-if="auth.user">
      <v-list class="pa-0">
        <v-list-item :href="'https://vk.com/id' + auth.user.id" target="_blank">
          <v-list-item-avatar color="#DDD">
            <img v-if="auth.user.photo_50" :src="auth.user.photo_50" />
            <v-icon v-else>mdi-account</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="name">{{ name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn text color="info" :href="'https://vk.com/id' + auth.user.id" target="_blank">
          Страница ВК
        </v-btn>
        <v-spacer />
        <v-btn text color="red" @click="auth.logout">Выйти</v-btn>
      </v-card-actions>
    </v-card>
    <v-btn v-else color="success" @click="login">Войти через ВК</v-btn>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import Cookies from 'js-cookie'

import {auth} from '@/store'
import {wait} from '@/utils'

@Component
export default class Profile extends Vue {
  auth = auth

  get name() {
    if (!auth.user) return ''
    return auth.user.first_name + ' ' + auth.user.last_name
  }

  async login() {
    const {origin} = location
    const w = window.open(
      `https://oauth.vk.com/authorize?client_id=7102165&display=popup&response_type=code&redirect_uri=${origin}/authvk`,
      undefined,
      'width=400,height=500,left=100,top=100,toolbar=0,menubar=0,location=0',
    )!

    let firetoken: string | null = null
    while (!firetoken) {
      if (w.closed) return
      await wait(200)
      firetoken = Cookies.get('firetoken') || null
      if (firetoken) w.close()
    }
    Cookies.remove('firetoken')
    if (firetoken === 'no') return

    await auth.login(firetoken)
  }
}
</script>

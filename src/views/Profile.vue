<template>
  <v-layout column>
    <portal to="header-title">Профиль</portal>
    <v-card v-if="auth.user">
      <source-name :id="auth.user.id" no-link>
        <v-btn text color="primary" large> {{ balls }} баллов </v-btn>
      </source-name>
      <v-card-actions>
        <v-btn text color="info" :href="'https://vk.com/id' + auth.user.id" target="_blank">
          Страница ВК
        </v-btn>
        <v-spacer />
        <v-btn text color="red" @click="auth.logout">Выйти</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else>
      <v-card-actions class="py-5">
        <v-spacer />
        <v-btn color="success" @click="login" large>Войти через ВК</v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator'
import Cookies from 'js-cookie'

import db from '@/db'
import {auth} from '@/store'
import {wait} from '@/utils'

import SourceName from '@/components/SourceName.vue'

@Component({
  components: {SourceName},
})
export default class Profile extends Vue {
  auth = auth
  balls = 0

  get name() {
    if (!auth.user) return ''
    return auth.user.first_name + ' ' + auth.user.last_name
  }

  get user() {
    return auth.user
  }

  @Watch('user', {immediate: true})
  async getBalls(id: string) {
    if (!this.user) {
      this.balls = 0
      return
    }
    const r = await db
      .collection('rating')
      .doc(String(this.user.id))
      .get()
    if (!r.exists) this.balls = 0
    else this.balls = r.data()!.total
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

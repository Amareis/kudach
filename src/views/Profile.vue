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
        <login-button color="success" large>Войти через ВК</login-button>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator'

import db from '@/db'
import {auth} from '@/store'

import SourceName from '@/components/SourceName.vue'
import LoginButton from '@/components/LoginButton.vue'

@Component({
  components: {SourceName, LoginButton},
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
  async getBalls() {
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
}
</script>

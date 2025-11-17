<template>
  <v-btn icon :color="exists ? 'red' : 'primary'" @click="handle">
    <v-icon>{{ exists ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
    <v-dialog v-model="loginModal" width="500">
      <v-card>
        <v-card-title primary-title>Нужно войти</v-card-title>

        <v-card-text>
          Чтобы добавлять события в избранное, войдите через ВКонтакте (это займёт меньше минуты!)
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn text @click="loginModal = false"> Закрыть </v-btn>
          <v-spacer></v-spacer>
          <login-button color="primary" @login="onLogin"> Войти </login-button>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" bottom color="success" :timeout="2500">
      {{ exists ? 'добавлено в избранное' : 'больше не избранное' }}
    </v-snackbar>
  </v-btn>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import moment from 'moment'

import db from '@/db'
import {auth} from '@/store'

import {IUser} from '@/vk'
import LoginButton from '@/components/LoginButton.vue'

@Component({
  components: {LoginButton},
})
export default class FaveButton extends Vue {
  @Prop() private readonly id!: string

  loginModal = false
  snackbar = false
  exists = false

  query(user: IUser) {
    return db.collection('users').doc(String(user.id)).collection('favorite').doc(this.id)
  }

  created() {
    this.load()
  }

  async load() {
    if (!auth.user) return
    const doc = await this.query(auth.user).get()
    this.exists = doc.exists
  }

  async onLogin() {
    this.loginModal = false
    await this.load()
    this.handle()
  }

  handle() {
    if (this.exists) this.del()
    else this.add()
  }

  async add() {
    if (!auth.user) {
      this.loginModal = true
      return
    }
    await this.query(auth.user).set({faveAt: moment().toISOString()})
    this.exists = true
    this.snackbar = true
  }

  async del() {
    if (!auth.user) {
      this.loginModal = true
      return
    }
    await this.query(auth.user).delete()
    this.exists = false
    this.snackbar = true
  }
}
</script>

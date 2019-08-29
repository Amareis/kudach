<template>
  <v-btn text color="success" @click="checkin">
    Чекин
    <v-dialog v-model="loginModal" width="500">
      <v-card>
        <v-card-title primary-title>Нужно войти</v-card-title>

        <v-card-text>
          Чтобы зачекиниться с события, войдите через ВКонтакте (это займёт меньше минуты!)
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn text @click="loginModal = false">
            Закрыть
          </v-btn>
          <v-spacer></v-spacer>
          <login-button color="primary" @login="checkin">
            Войти
          </login-button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-btn>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import {auth} from '@/store'
import LoginButton from '@/components/LoginButton.vue'
@Component({
  components: {LoginButton},
})
export default class CheckinButton extends Vue {
  @Prop() private readonly id!: string

  loginModal = false

  async checkin() {
    if (!auth.user) {
      this.loginModal = true
      return
    }

    this.$router.push({name: 'checkin', params: {id: this.id}})
  }
}
</script>

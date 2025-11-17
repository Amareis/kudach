<template>
  <v-layout column>
    <portal to="header-icon">
      <v-app-bar-nav-icon>
        <back-button />
      </v-app-bar-nav-icon>
    </portal>
    <portal to="header-title">Добавить событие</portal>

    <v-card v-if="showLogin">
      <v-card-title primary-title>Нужно войти</v-card-title>

      <v-card-text>
        Чтобы добавлять события, войдите через ВКонтакте (это займёт меньше минуты!)
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <login-button color="primary" @login="showLogin = false"> Войти </login-button>
      </v-card-actions>
    </v-card>

    <template v-else>
      <new-propose class="mb-3" @proposed="proposals.unshift($event)" />
      <propose-edit v-for="p in proposals" :key="p.id" :propose="p" class="mb-3" />
    </template>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

import {auth} from '@/store'
import db, {IProposed} from '@/db'

import NewPropose from '@/components/NewPropose.vue'
import BackButton from '@/components/BackButton.vue'
import LoginButton from '@/components/LoginButton.vue'
import ProposeEdit from '@/components/ProposeEdit.vue'

@Component({
  components: {ProposeEdit, LoginButton, BackButton, NewPropose},
})
export default class Proposals extends Vue {
  showLogin = !auth.user

  proposals: IProposed[] = []

  async created() {
    const d = await db
      .collection('proposed')
      .where('accepted', '==', null)
      .orderBy('createdAt')
      .get()
    this.proposals = d.docs.map((d) => d.data() as IProposed)
  }
}
</script>

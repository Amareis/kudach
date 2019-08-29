<template>
  <v-btn v-bind="$attrs" v-on="$listeners" @click="login"><slot /></v-btn>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import Cookies from 'js-cookie'

import {auth} from '@/store'
import {wait} from '@/utils'

@Component
export default class LoginButton extends Vue {
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
    this.$emit('login')
  }
}
</script>

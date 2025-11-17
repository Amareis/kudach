<template>
  <v-btn v-bind="$attrs" v-on="$listeners" @click="login"><slot /></v-btn>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import Cookies from 'js-cookie'

import {auth} from '@/store'
import {wait} from '@/utils'
import {generateCodeVerifier, generateCodeChallenge} from '@/utils/pkce'

@Component
export default class LoginButton extends Vue {
  async login() {
    const {origin} = location

    // Генерируем PKCE параметры
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // Генерируем state для защиты от CSRF
    const state = generateCodeVerifier()

    // Сохраняем code_verifier и state в sessionStorage для проверки после авторизации
    sessionStorage.setItem('vk_code_verifier', codeVerifier)
    sessionStorage.setItem('vk_state', state)

    // URL функции авторизации (Yandex Cloud или локальный прокси)
    const authFunctionUrl = import.meta.env.VITE_AUTH_FUNCTION_URL || `${origin}/authvk`

    // Кодируем code_verifier и state в один параметр state
    // Формат: state---code_verifier (разделитель - три черточки)
    const combinedState = `${state}---${codeVerifier}`

    console.log('=== VK OAuth Parameters ===')
    console.log('Origin:', origin)
    console.log('Auth function URL (redirect_uri):', authFunctionUrl)
    console.log('State:', state)
    console.log('Code verifier length:', codeVerifier.length)
    console.log('Code challenge:', codeChallenge)
    console.log('Combined state:', combinedState)

    // Открываем окно авторизации VK
    // ВАЖНО: redirect_uri НЕ должен содержать code_verifier!
    const authUrl =
      `https://id.vk.com/authorize?` +
      `client_id=54313568&` +
      `display=popup&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(authFunctionUrl)}&` +
      `state=${encodeURIComponent(combinedState)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`

    const w = window.open(
      authUrl,
      undefined,
      'width=400,height=500,left=100,top=100,toolbar=0,menubar=0,location=0',
    )!

    // Ждем сообщение от popup окна через postMessage
    const firetoken = await new Promise<string | null>((resolve) => {
      const messageHandler = (event: MessageEvent) => {
        // Проверяем, что сообщение от нашего popup
        if (event.data && event.data.type === 'vk_auth_success') {
          window.removeEventListener('message', messageHandler)
          resolve(event.data.token)
        } else if (event.data && event.data.type === 'vk_auth_error') {
          window.removeEventListener('message', messageHandler)
          console.error('VK Auth error:', event.data.error)
          if (event.data.details) {
            console.error('Error details:', event.data.details)
          }
          alert(`Ошибка авторизации: ${event.data.error}\n\nПодробности в консоли разработчика (F12)`)
          resolve(null)
        }
      }

      window.addEventListener('message', messageHandler)

      // Проверяем, не закрыто ли окно
      const checkClosed = setInterval(() => {
        if (w.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          resolve(null)
        }
      }, 200)
    })

    // Очищаем данные после авторизации
    sessionStorage.removeItem('vk_code_verifier')
    sessionStorage.removeItem('vk_state')

    if (!firetoken) return

    await auth.login(firetoken)
    this.$emit('login')
  }
}
</script>

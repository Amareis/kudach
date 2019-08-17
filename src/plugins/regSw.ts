/* eslint-disable no-console */

import {register} from 'register-service-worker'
import app from '../main'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('App is being served from cache by a service worker https://goo.gl/AFskqB')
    },
    registered() {
      console.log('Service worker has been registered.')
    },
    cached() {
      console.log('Content has been cached for offline use.')
    },
    updatefound() {
      console.log('New content is downloading.')
    },
    updated(reg) {
      console.log('New content is available; please refresh.')
      if (reg.waiting) {
        app.$on('reload-sw', () => {
          reg.waiting.postMessage({type: 'SKIP_WAITING'})
          setTimeout(() => location.reload(), 500)
        })
        app.$emit('sw-updated')
      }
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error(error) {
      console.error('Error during service worker registration:', error)
    },
  })
}

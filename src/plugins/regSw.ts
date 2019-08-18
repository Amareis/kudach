import {register} from 'register-service-worker'
import {updater} from '@/store'

// eslint-disable-next-line no-console
const log = (...args: any[]) => console.log(...args)
// eslint-disable-next-line no-console
const error = (...args: any[]) => console.error(...args)

export function update(reg: ServiceWorkerRegistration) {
  if (reg.waiting) {
    updater.update(() => {
      reg.waiting && reg.waiting.postMessage({type: 'SKIP_WAITING'})
      setTimeout(() => location.reload(), 500)
    })
  }
}

export async function reload() {
  if (!navigator.serviceWorker) return location.reload()

  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return location.reload()
  await reg.update()
  update(reg)
}

if (process.env.NODE_ENV /*=== 'production'*/) {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      log('App is being served from cache by a service worker https://goo.gl/AFskqB')
    },
    registered() {
      log('Service worker has been registered.')
    },
    cached() {
      log('Content has been cached for offline use.')
    },
    updatefound() {
      log('New content is downloading.')
    },
    updated(reg) {
      log('New content is available; please refresh.')
      update(reg)
    },
    offline() {
      log('No internet connection found. App is running in offline mode.')
    },
    error(err) {
      error('Error during service worker registration:', err)
    },
  })
}

import {registerSW} from 'virtual:pwa-register'
import {updater} from '@/store'

// eslint-disable-next-line no-console
const log = (...args: any[]) => console.log(...args)

export async function reload() {
  if (!navigator.serviceWorker) return location.reload()

  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return location.reload()
  await reg.update()
  if (reg.waiting) {
    reg.waiting.postMessage({type: 'SKIP_WAITING'})
    setTimeout(() => location.reload(), 500)
  }
}

// Register service worker with Vite PWA plugin
const updateSW = registerSW({
  onNeedRefresh() {
    log('New content is available; please refresh.')
    updater.update(() => {
      updateSW(true)
    })
  },
  onOfflineReady() {
    log('App is ready to work offline.')
  },
  onRegistered(registration) {
    log('Service worker has been registered.')
    if (registration) {
      // Check for updates every hour
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    console.error('Error during service worker registration:', error)
  },
})

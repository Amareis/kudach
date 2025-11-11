import Vue from 'vue'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

if (import.meta.env.MODE === 'production')
  Sentry.init({
    dsn: 'https://d2d3b78acc0d43b39e0e2288d448b44e@sentry.io/1443943',
    integrations: [new Integrations.Vue({Vue, attachProps: true})],
  })

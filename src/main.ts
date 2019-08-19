import 'reflect-metadata'

import './plugins/sentry'
import './plugins/regSw'
import './plugins/analytics'

import Vue from 'vue'
import PortalVue from 'portal-vue'
import moment from 'moment'

import router from './router'
import * as app from './store'
import vuetify from './vuetify'

import App from './App.vue'

Object.assign(window, {app})

Vue.config.productionTip = false
Vue.use(PortalVue)

moment.locale('ru-RU')

const store = app.default

export default new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')

import Vue from 'vue'
import VueAnalytics from 'vue-analytics'

import router from '@/router'

if (import.meta.env.MODE === 'production')
  Vue.use(VueAnalytics, {
    id: 'UA-138700126-1',
    router,
  })

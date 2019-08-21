import Vue from 'vue'
import VueRouter from 'vue-router'

import List from '@/views/List.vue'
import Details from '@/views/Details.vue'
import Preview from '@/views/Preview.vue'
import Profile from '@/views/Profile.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'list',
      component: List,
      props: route => ({date: route.query.date}),
    },
    {
      path: '/e/:id',
      name: 'details',
      component: Details,
      props: true,
    },
    {
      path: '/me',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/preview/:id',
      name: 'preview',
      component: Preview,
      props: true,
    },
  ],
})

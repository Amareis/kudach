import Vue from 'vue'
import VueRouter, {NavigationGuard} from 'vue-router'

import {auth, loader} from '@/store'

import List from '@/views/List.vue'
import Details from '@/views/Details.vue'
import Profile from '@/views/Profile.vue'
import Favorite from '@/views/Favorite.vue'
import Checkin from '@/views/Checkin.vue'
import Rating from '@/views/Rating.vue'
import Proposals from '@/views/Proposals.vue'

const Admin = () => import(/* webpackChunkName: "admin" */ '@/admin/Admin.vue')
const Checkins = () => import(/* webpackChunkName: "admin" */ '@/admin/views/Checkins.vue')
const Edit = () => import(/* webpackChunkName: "admin" */ '@/admin/views/Edit.vue')
const Promotes = () => import(/* webpackChunkName: "admin" */ '@/admin/views/Promotes.vue')
const Stats = () => import(/* webpackChunkName: "admin" */ '@/admin/views/Stats.vue')

Vue.use(VueRouter)

const needAuth: NavigationGuard = async (to, from, next) => {
  await loader.ensure()
  if (!auth.isAdmin) next({name: 'profile'})
  else next()
}

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
      path: '/checkin/:id',
      name: 'checkin',
      component: Checkin,
      props: true,
    },
    {
      path: '/me',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/favorite',
      name: 'favorite',
      component: Favorite,
    },
    {
      path: '/rating',
      name: 'rating',
      component: Rating,
    },
    {
      path: '/proposals',
      name: 'proposals',
      component: Proposals,
    },
    {
      path: '/admin',
      component: Admin,
      beforeEnter: needAuth,
      children: [
        {
          path: '',
          name: 'checkins',
          component: Checkins,
        },
        {
          path: 'edit/:id',
          name: 'edit',
          component: Edit,
          props: true,
        },
        {
          path: 'promotes',
          name: 'promotes',
          component: Promotes,
        },
        {
          path: 'stats',
          name: 'stats',
          component: Stats,
        },
      ],
    },
  ],
})

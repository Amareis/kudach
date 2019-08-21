import {VuexModule, Mutation, Action} from 'vuex-module-decorators'

import {wait} from '@/utils'

import {instanceOf, Reg} from './_store'
import settings from './settings'
import auth from './auth'

@Reg('loader')
export class Loader extends VuexModule {
  loaded = false

  @Mutation done() {
    this.loaded = true
  }

  @Action async load() {
    await Promise.all([settings.load(), auth.load()])
    this.done()
  }

  @Action async ensure() {
    while (!this.loaded) await wait(100)
  }
}

export default instanceOf(Loader)

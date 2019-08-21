import {VuexModule, Mutation, Action} from 'vuex-module-decorators'

import {instanceOf, Reg} from './_store'
import settings from './settings'
import auth from './auth'

@Reg()
export class Loader extends VuexModule {
  loaded = false

  @Mutation done() {
    this.loaded = true
  }

  @Action async load() {
    await Promise.all([settings.load(), auth.load()])
    this.done()
  }
}

export default instanceOf(Loader)

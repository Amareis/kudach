import {Module, VuexModule, Mutation, Action, getModule} from 'vuex-module-decorators'

import store from './_store'

@Module({name: 'updater', dynamic: true, store, namespaced: true})
export class Updater extends VuexModule {
  private apply: null | Lambda = null

  get hasUpdate() {
    return !!this.apply
  }

  @Mutation update(apply: Lambda) {
    this.apply = apply
  }

  @Action applyUpdate() {
    if (!this.apply) throw new Error('There is no update!')
    this.apply()
  }
}

export default getModule(Updater, store)

import {VuexModule, Mutation, Action} from 'vuex-module-decorators'

import {instanceOf, Reg} from './_store'

@Reg('updater')
export class Updater extends VuexModule {
  private apply: null | Lambda = null

  applying = false

  get hasUpdate() {
    return !!this.apply
  }

  @Mutation update(apply: Lambda) {
    this.apply = apply
  }

  @Mutation setApplying(applying: boolean) {
    this.applying = applying
  }

  @Action applyUpdate() {
    if (!this.apply) throw new Error('There is no update!')
    this.setApplying(true)
    this.apply()
  }
}

export default instanceOf(Updater)

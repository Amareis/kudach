import {VuexModule, Mutation} from 'vuex-module-decorators'

import {instanceOf, Reg} from './_store'

@Reg('router')
export class Router extends VuexModule {
  hasBack = false

  @Mutation setHasBack(has: boolean) {
    this.hasBack = has
  }
}

export default instanceOf(Router)

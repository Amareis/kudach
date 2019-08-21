import {VuexModule, Mutation, Action} from 'vuex-module-decorators'

import {version} from '@/../package.json'

import db, {live} from '@/db'

import {instanceOf, Reg} from './_store'

@Reg('settings')
export class Settings extends VuexModule {
  version = version

  get currentVersion() {
    return version
  }

  @Mutation set(data: any) {
    this.version = data.version
  }

  @Action async load() {
    await live(db.collection('other').doc('settings'), s => this.set(s.data()))
  }

  get hasMajorUpdate() {
    return this.currentVersion !== this.version
  }
}

export default instanceOf(Settings)

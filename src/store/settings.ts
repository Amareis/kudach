import {VuexModule, Mutation, Action} from 'vuex-module-decorators'

import {version} from '@/../package.json'

import db from '@/db'

import {instanceOf, Reg} from './_store'

@Reg()
export class Settings extends VuexModule {
  loaded = false
  version = version

  get currentVersion() {
    return version
  }

  @Mutation set(data: any) {
    this.loaded = true
    this.version = data.version
  }

  @Action load() {
    db.collection('other')
      .doc('settings')
      .onSnapshot(s => this.set(s.data()))
  }

  get hasMajorUpdate() {
    return this.currentVersion !== this.version
  }
}

export default instanceOf(Settings)

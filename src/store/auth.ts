import {VuexModule, Mutation, Action} from 'vuex-module-decorators'

import {getUsers, IUser} from '@/vk'
import db, {auth} from '@/db'

import {instanceOf, Reg} from './_store'

@Reg('auth')
export class Auth extends VuexModule {
  user: IUser | null = null
  scope: string[] = []

  @Mutation setUser(user: IUser | null) {
    this.user = user
    if (!user) this.scope = []
  }

  @Mutation setScope(scope: string[]) {
    this.scope = scope
  }

  @Action async load() {
    await new Promise((resolve) => {
      const un = auth.onAuthStateChanged((user) => {
        this.handleUserId(user && user.uid).then(() => {
          un()
          resolve()
        })
      })
    })
  }

  @Action private async handleUserId(userId: string | null) {
    if (userId) {
      const [[u], d] = await Promise.all([
        getUsers(userId),
        db.collection('users').doc(userId).get(),
      ])
      this.setUser(u)
      this.setScope((d.data() || {}).scope || [])
    } else this.setUser(null)
  }

  @Action async login(token: string) {
    const {user} = await auth.signInWithCustomToken(token)
    await this.handleUserId(user && user.uid)
  }

  @Action async logout() {
    await auth.signOut()
    await this.handleUserId(null)
  }

  get isAdmin() {
    return this.scope.includes('admin')
  }
}

export default instanceOf(Auth)

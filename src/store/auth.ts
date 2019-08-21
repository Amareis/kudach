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
    await new Promise(resolve =>
      auth.onAuthStateChanged(user => {
        this.handleUserId(user && user.uid).then(resolve)
      }),
    )
  }

  @Action private async handleUserId(userId: string | null) {
    if (userId) {
      const [[u], d] = await Promise.all([
        getUsers(userId),
        db
          .collection('users')
          .doc(userId)
          .get(),
      ])
      this.setUser(u)
      this.setScope((d.data() || {}).scope || [])
    } else this.setUser(null)
  }

  @Action async login(token: string) {
    return await auth.signInWithCustomToken(token)
  }

  @Action async logout() {
    return await auth.signOut()
  }

  get isAdmin() {
    return this.scope.includes('admin')
  }
}

export default instanceOf(Auth)

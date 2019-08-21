import {VuexModule, Mutation, Action} from 'vuex-module-decorators'
import {User} from 'firebase'

import {getUsers, IUser} from '@/vk'
import {auth} from '@/db'

import {instanceOf, Reg} from './_store'

@Reg()
export class Auth extends VuexModule {
  user: IUser | null = null

  @Mutation set(user: IUser | null) {
    this.user = user
  }

  @Action async load() {
    await new Promise(resolve =>
      auth.onAuthStateChanged(user => {
        this.handleUser(user)
        resolve()
      }),
    )
  }

  @Action async handleUser(user: User | null) {
    if (user) {
      const [u] = await getUsers(user.uid)
      this.set(u)
    } else this.set(null)
  }

  @Action async login(token: string) {
    return await auth.signInWithCustomToken(token)
  }

  @Action async logout() {
    return await auth.signOut()
  }
}

export default instanceOf(Auth)

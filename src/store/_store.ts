import Vue from 'vue'
import Vuex from 'vuex'
import {getModule, Module, VuexModule} from 'vuex-module-decorators'

Vue.use(Vuex)

const s = new Vuex.Store({
  state: {},
})

export default s

export function Reg(name: string, store = s): ClassDecorator {
  return (f) => Module({name, dynamic: true, store, namespaced: true})(f)
}

type ConstructorOf<C> = {
  new (...args: any[]): C
}

export function instanceOf<M extends VuexModule>(moduleClass: ConstructorOf<M>, store = s) {
  return getModule(moduleClass, store)
}

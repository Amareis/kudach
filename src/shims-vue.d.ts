declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue-analytics' {
  import {PluginObject} from 'vue'
  let VueAnalytics: PluginObject<any>
  export default VueAnalytics
}

/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue-analytics' {
  import {PluginObject} from 'vue'
  let VueAnalytics: PluginObject<any>
  export default VueAnalytics
}

declare type Lambda = () => void

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

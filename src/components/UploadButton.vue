<template>
  <v-btn v-bind="$attrs" v-on="$listeners" @click="$refs.uploadFile.click()">
    <slot />
    <input
      :id="`$uploadFile`"
      ref="uploadFile"
      class="input"
      type="file"
      :name="name"
      :accept="accept"
      :multiple="multiple"
      @change="fileChanged"
    />
  </v-btn>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component({
  inheritAttrs: false,
})
export default class UploadButton extends Vue {
  @Prop({default: 'uploadFile'}) private readonly name!: string
  @Prop({default: '*'}) private readonly accept!: string
  @Prop({default: false}) private readonly multiple!: boolean

  $refs!: {
    uploadFile: HTMLInputElement
  }

  fileChanged({target}: Event) {
    if (!(target instanceof HTMLInputElement)) return
    if (target.files && target.files.length > 0) {
      if (!this.multiple) this.$emit('file-update', [target.files[0]])
      else this.$emit('file-update', target.files)
    }
  }

  clear() {
    this.$refs.uploadFile.value = ''
  }
}
</script>

<style scoped>
.input {
  position: absolute;
  height: 0.1px;
  width: 0.1px;
  overflow: hidden;
  opacity: 0;
  z-index: -1;
}
</style>

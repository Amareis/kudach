<template>
  <v-col>
    <Item v-for="(item, i) in items" :key="i" :item="item" :possible-events="[]" />
  </v-col>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {getItems, IGroup, IPost} from '@/vk'

import Item from '@/components/Item.vue'

@Component({
  components: {Item},
})
export default class Preview extends Vue {
  @Prop() private readonly id!: string

  items: Array<IGroup | IPost> = []

  async created() {
    this.items = (await getItems(this.id.split(','))).flatMap(i => (i ? [i] : []))
    this.$nextTick(() => {
      if (window.top === window) return
      window.top.postMessage(document.body.scrollHeight, '*')
    })
  }
}
</script>

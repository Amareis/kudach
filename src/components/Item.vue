<template>
  <Post v-if="isPost" :post="item" :events="events" :short="short" />
  <Group v-else :group="item" :events="events" :short="short" />
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {IEvent} from '@/db'
import {IGroup, IPost, isPost} from '@/vk'

import Post from './Post.vue'
import Group from './Group.vue'

@Component({
  components: {Post, Group},
})
export default class Item extends Vue {
  @Prop() private readonly item!: IGroup | IPost
  @Prop({default: false}) private readonly short!: boolean
  @Prop({default: () => []}) private readonly possibleEvents!: IEvent[]

  get isPost() {
    return isPost(this.item)
  }

  get id() {
    return isPost(this.item) ? this.item.owner_id + '_' + this.item.id : String(-this.item.id)
  }

  get events() {
    return this.possibleEvents.filter(e => e.id === this.id)
  }
}
</script>

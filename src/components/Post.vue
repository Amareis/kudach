<template>
  <Card
    :id="id"
    :source-id="post.owner_id"
    :events="events"
    :short="short"
    :text="post.text"
    :images="images"
  />
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {IEvent} from '@/db'
import {biggestOf, IPost, postId} from '@/vk'

import Card from './Card.vue'

@Component({
  components: {Card},
})
export default class Post extends Vue {
  @Prop() private readonly post!: IPost
  @Prop({default: false}) private readonly short!: boolean
  @Prop() private readonly events!: IEvent[]

  get id() {
    return postId(this.post)
  }

  get attachments() {
    return this.post.attachments || []
  }

  get photos() {
    return this.attachments.flatMap(a => (a.type === 'photo' ? [a.photo] : []))
  }

  get videos() {
    return this.attachments.flatMap(a => (a.type === 'video' ? [a.video] : []))
  }

  get links() {
    return this.attachments.flatMap(a => (a.type === 'link' ? [a.link] : []))
  }

  get images() {
    const p = this.photos[0]
    if (p) return [biggestOf(p)]

    const v = this.videos[0]
    if (v)
      return [
        {
          ...v,
          url: v.photo_1280 || v.photo_800 || v.photo_640 || v.photo_320,
        },
      ]

    const l = this.links[0]
    if (l && l.photo) return [biggestOf(l.photo)]

    return []
  }
}
</script>

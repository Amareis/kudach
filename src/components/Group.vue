<template>
  <Card
    :id="id"
    :source-id="-group.id"
    :events="events"
    :short="short"
    :text="group.description"
    :images="images"
    is-group
  />
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {IEvent} from '@/db'
import {biggestOf, IGroup} from '@/vk'

import Card from './Card.vue'

@Component({
  components: {Card},
})
export default class Group extends Vue {
  @Prop() private readonly group!: IGroup
  @Prop({default: false}) private readonly short!: boolean
  @Prop() private readonly events!: IEvent[]

  get id() {
    return String(-this.group.id)
  }

  get images() {
    const p = this.group.crop_photo
    if (p) return [biggestOf(p.photo)]

    return []
  }
}
</script>

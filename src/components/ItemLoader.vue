<template>
  <v-layout v-if="loading" justify-center><v-progress-circular indeterminate/></v-layout>
  <v-card v-else-if="!item">
    <v-card-text>Нет такого события!</v-card-text>
  </v-card>
  <Item v-else :item="item" :possible-events="events" :short="short" />
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import db, {IEvent} from '@/db'
import {getItems, IGroup, IPost} from '@/vk'

import Item from '@/components/Item.vue'

@Component({
  components: {Item},
})
export default class ItemLoader extends Vue {
  @Prop() private readonly id!: string
  @Prop({default: false}) private readonly short!: boolean

  loading = true
  events: IEvent[] = []
  item: IGroup | IPost | null = null

  async created() {
    const [e, items] = await Promise.all([
      db
        .collection('events')
        .where('id', '==', this.id)
        .get(),
      getItems(this.id),
    ])
    if (e.docs.length) this.events = e.docs.map(d => d.data() as IEvent)
    if (items.length) this.item = items[0]
    this.loading = false
  }
}
</script>

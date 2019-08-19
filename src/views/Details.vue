<template>
  <v-progress-circular v-if="loading" indeterminate />
  <v-flex v-else xs12 sm9 md7 lg6>
    <v-card v-if="!events || !item">
      <v-card-text>Нет такого события!</v-card-text>
    </v-card>
    <Item v-else :item="item" :possible-events="events" />
  </v-flex>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import db, {IEvent} from '@/db'
import {getItems, IGroup, IPost} from '@/vk'

import Item from '@/components/Item.vue'

@Component({
  components: {Item},
})
export default class Details extends Vue {
  @Prop() private readonly id!: string

  loading = true
  events: IEvent[] | null = null
  item: IGroup | IPost | null = null

  async created() {
    const [e, items] = await Promise.all([
      db
        .collection('events')
        .where('id', '==', this.id)
        .get(),
      getItems(this.id),
    ])
    if (e.docs.length && items.length) {
      this.events = e.docs.map(d => d.data() as IEvent)
      this.item = items[0]
    }
    this.loading = false
  }
}
</script>

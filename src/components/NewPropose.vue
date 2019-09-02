<template>
  <v-card>
    <v-card-actions>
      <item-getter collection="events" @item="check" @exist="existing = $event" ref="getter" />
    </v-card-actions>

    <Item v-if="item" :item="item" class="mb-3" />

    <v-card-actions v-if="existing || item" class="pt-0">
      <v-btn text @click="clear">Отмена</v-btn>
      <v-spacer />
      <v-btn v-if="existing" class="info" :to="{name: 'details', params: {id: existing}}"
        >Открыть</v-btn
      >
      <v-btn v-if="item" text class="success" @click="propose(item)">Предложить</v-btn>
    </v-card-actions>

    <v-card-text v-if="success" class="green--text">
      Пост предложен, скоро его одобрит модератор и он появится на сайте!
    </v-card-text>

    <v-card-text v-if="alreadyProposed" class="red--text">Пост уже предложен!</v-card-text>
  </v-card>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import moment from 'moment'

import {idOf, IGroup, IPost} from '@/vk'
import db, {IProposed} from '@/db'
import {auth} from '@/store'

import ItemGetter from '@/components/ItemGetter.vue'
import Item from '@/components/Item.vue'

@Component({
  components: {Item, ItemGetter},
})
export default class NewPropose extends Vue {
  item: IGroup | IPost | null = null
  existing = false
  alreadyProposed = false
  success = false

  $refs!: {
    getter: any
  }

  clear() {
    this.$refs.getter.clear()
    this.alreadyProposed = false
    this.success = false
  }

  async check(item: IGroup | IPost | null) {
    this.alreadyProposed = false
    this.success = false
    this.item = null

    if (!item) return

    let doc = db.collection('proposed').doc(idOf(item))
    const d = await doc.get()
    if (d.exists) this.alreadyProposed = true
    else this.item = item
  }

  async propose(item: IGroup | IPost) {
    const id = idOf(item)
    let doc = db.collection('proposed').doc(id)
    let p: IProposed = {
      id,
      user: auth.user!.id,
      createdAt: moment().toISOString(),
      accepted: null,
    }
    await doc.set(p)
    this.clear()
    this.success = true
    this.$emit('proposed', p)
  }
}
</script>

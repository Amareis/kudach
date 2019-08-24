<template>
  <v-layout column>
    <v-layout column v-if="items" v-scroll="checkScroll">
      <v-card v-if="!items.length" class="mt-3">
        <v-card-text>Пока вы ничего не добавили в избранное!</v-card-text>
      </v-card>

      <template v-for="i in items">
        <item-loader :key="i" :id="i" short class="mb-4" />
      </template>
    </v-layout>
    <v-progress-circular class="align-self-center" v-if="loading" indeterminate />
  </v-layout>
</template>

<script lang="ts">
import {firestore} from 'firebase'
import {Component, Vue} from 'vue-property-decorator'

import {auth} from '@/store'
import db from '@/db'

import ItemLoader from '@/components/ItemLoader.vue'

type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot

@Component({
  components: {ItemLoader},
})
export default class Favorite extends Vue {
  loading = false

  items: Array<string> | null = null
  last: QueryDocumentSnapshot | null = null
  portion = 15

  created() {
    this.load()
  }

  query() {
    return db
      .collection('users')
      .doc(String(auth.user!.id))
      .collection('favorite')
      .orderBy('faveAt', 'desc')
  }

  async load(more = false) {
    if (this.loading || (more && !this.last)) return

    if (!more) this.items = null
    this.loading = true

    let q = this.query()
    if (more) q = q.startAfter(this.last)

    const ids = await q.limit(this.portion).get()
    this.last = ids.docs[ids.docs.length - 1]

    this.items = (this.items || []).concat(ids.docs.map(e => e.id))

    this.loading = false
  }

  checkScroll() {
    if (document.body.scrollHeight - scrollY < innerHeight * 2) this.load(true)
  }
}
</script>

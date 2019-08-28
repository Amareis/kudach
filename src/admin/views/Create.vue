<template>
  <v-layout column>
    <v-flex class="pl-2 pr-2">
      <item-getter collection="events" @item="item = $event" @exist="existing = $event" />
    </v-flex>
    <v-btn v-if="existing" class="success" :to="{name: 'edit', params: {id: existing}}"
      >Редактировать</v-btn
    >
    <Preview v-if="item" :item="item" />

    <template v-if="!item">
      <checkin-edit v-for="(c, i) in checkins" :checkin="c" :key="i" />
    </template>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

import {IGroup, IPost} from '@/vk'
import db, {ICheckin} from '@/db'

import ItemGetter from '@/admin/components/ItemGetter.vue'
import Preview from '@/admin/components/Preview.vue'
import CheckinEdit from '@/admin/components/CheckinEdit.vue'

@Component({
  components: {ItemGetter, Preview, CheckinEdit},
})
export default class Create extends Vue {
  item: IGroup | IPost | null = null
  existing = false
  checkins: ICheckin[] = []

  async created() {
    this.checkins = (await db
      .collection('checkins')
      .where('accepted', '==', null)
      .get()).docs.map(d => d.data() as ICheckin)
  }
}
</script>

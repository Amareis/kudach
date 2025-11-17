<template>
  <v-layout column>
    <checkin-edit v-for="(c, i) in checkins" :checkin="c" :key="i" />
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

import db, {ICheckin} from '@/db'

import CheckinEdit from '@/admin/components/CheckinEdit.vue'

@Component({
  components: {CheckinEdit},
})
export default class Checkins extends Vue {
  checkins: ICheckin[] = []

  async created() {
    this.checkins = (await db.collection('checkins').where('accepted', '==', null).get()).docs.map(
      (d) => d.data() as ICheckin,
    )
  }
}
</script>

<template>
  <v-layout column>
    <v-card v-for="(i, ind) in items" :key="i.user" class="mb-2">
      <source-name :id="i.user" :subtitles="[ind + 1 + ' место']">
        <v-btn text color="primary" @click.prevent=""> {{ i.total }} баллов </v-btn>
      </source-name>
    </v-card>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

import db from '@/db'

import SourceName from '@/components/SourceName.vue'

interface IRate {
  user: number
  total: number
}

@Component({
  components: {SourceName},
})
export default class Rating extends Vue {
  items: IRate[] = []

  async created() {
    this.items = (await db
      .collection('rating')
      .orderBy('total', 'desc')
      .limit(30)
      .get()).docs.map(d => d.data() as IRate)
  }
}
</script>

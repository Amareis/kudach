<template>
  <v-dialog v-model="show" max-width="800" scrollable>
    <template #activator="{ on }">
      <v-btn v-on="on" :disabled="checking || !events.length" color="warning" block>
        {{ text }}
      </v-btn>
    </template>
    <v-card>
      <v-card-text class="pa-0">
        <item-loader v-for="id in ids" :key="id" :id="id" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text color="red" @click="show = false">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import db from '@/db'
import ItemLoader from '@/components/ItemLoader'

export default {
  name: 'CheckTime',
  components: {ItemLoader},
  props: {
    time: String,
  },
  data() {
    return {
      checking: false,
      events: [],
      ids: [],
      show: false,
    }
  },
  computed: {
    text() {
      if (this.checking) return 'Проверяю события...'
      if (!this.events.length) return 'Нет событий в это время'
      return this.events.length + ' событий в это время'
    },
  },
  watch: {
    time: {
      handler() {
        this.checkPosts()
      },
      immediate: true,
    },
  },
  methods: {
    async checkPosts() {
      this.checking = true
      let e = await db
        .collection('events')
        .where('start', '==', this.time)
        .get()
      this.events = e.docs.map(d => d.data())
      this.ids = [...new Set(this.events.map(e => e.id))]
      this.checking = false
    },
  },
}
</script>

<style scoped lang="scss"></style>

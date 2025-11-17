<template>
  <v-card>
    <v-list v-if="sorted.length || !creating" two-line dense>
      <template v-for="e of sorted">
        <v-list-item
          v-if="e.uid !== editing"
          :key="e.uid"
          @click="
            editing = edit ? e.uid : null
            creating = false
          "
        >
          <v-list-item-action v-if="edit">
            <v-btn icon ripple @click.native.stop="del(e)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="text-uppercase"
              >{{ date(e.start) }} в {{ time(e.start) }}</v-list-item-title
            >
            <v-list-item-subtitle>Создано {{ created(e.createdAt) }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <create-event
          v-else
          :key="e.uid"
          :event="e"
          :id="id"
          @cancel="editing = null"
          @edited="load"
        />
        <v-divider :key="e.uid + 'div'" />
      </template>
      <v-list-item
        v-if="edit && !creating"
        @click="
          creating = true
          editing = null
        "
      >
        <v-list-item-action>
          <v-btn icon>
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Добавить...</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <create-event v-if="edit && creating" :id="id" @cancel="creating = false" @created="load" />
  </v-card>
</template>

<script>
import moment from 'moment'

import db, {auth} from '@/db'

import CreateEvent from './CreateEvent'

const timeFormat = {
  lastDay: '[вчера]',
  sameDay: '[сегодня]',
  nextDay: '[завтра]',
  lastWeek: '[было в] dddd',
  nextWeek: 'dddd',
  sameElse: 'L (dd)',
}

export default {
  name: 'Events',
  components: {CreateEvent},
  props: {
    id: String,
    edit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      events: [],
      creating: false,
      editing: null,
    }
  },
  created() {
    this.load()
  },
  computed: {
    sorted() {
      return [...this.events].sort((e1, e2) => new Date(e1.start) - new Date(e2.start))
    },
  },
  methods: {
    async load() {
      this.editing = null
      this.creating = false
      const e = await db.collection('events').where('id', '==', this.id).get()
      const events = e.docs.map((d) => ({...d.data(), uid: d.id}))
      this.events = events
      this.creating = !this.events.length
      this.$emit('change', events)
    },
    date(m) {
      return moment(m).calendar(null, timeFormat)
    },
    time(m) {
      return moment(m).format('HH:mm')
    },
    created(m) {
      return moment(m).format('L (dd) HH:mm')
    },
    async del(e) {
      await db.runTransaction(async () => {
        const d = {
          ...e,
          deletedBy: auth.currentUser.displayName,
          deletedAt: moment().toISOString(),
        }
        delete d.uid
        await db.collection('deleted').doc(e.uid).set(d)
        await db.collection('events').doc(e.uid).delete()
      })
      await this.load()
    },
  },
}
</script>

<style scoped lang="scss"></style>

<template>
  <v-layout column>
    <v-dialog
      ref="startDialog"
      v-model="startModal"
      :return-value.sync="start"
      full-width
      width="290px"
    >
      <template v-slot:activator="{on}">
        <v-text-field
          v-model="start"
          label="Начальная дата"
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="start" scrollable :first-day-of-week="1" locale="ru-RU" no-title>
        <v-spacer />
        <v-btn text color="primary" @click="$refs.startDialog?.save(start)">OK</v-btn>
      </v-date-picker>
    </v-dialog>
    <v-dialog ref="endDialog" v-model="endModal" :return-value.sync="end" full-width width="290px">
      <template v-slot:activator="{on}">
        <v-text-field
          v-model="end"
          label="Конечная дата"
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="end" scrollable :first-day-of-week="1" locale="ru-RU" no-title>
        <v-spacer />
        <v-btn text color="primary" @click="$refs.endDialog?.save(end)">OK</v-btn>
      </v-date-picker>
    </v-dialog>
    <v-btn color="primary" right large :disabled="!(start && end)" @click="load()">Загрузить</v-btn>
    <v-layout v-if="loaded"
      ><br /><br />
      {{ users.length }} новых пользователей<br />
      {{ checkins.length }} чекинов<br />
      <br />
      {{ events.length }} событий добавлено<br />
      <br />
      {{ uniqueCheckins.length }} пользователей зачекинилось ({{ sum }} рублей)
    </v-layout>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import db, {ICheckin, IEvent, firebase} from '@/db'
import moment from 'moment'
import {VDialog} from 'vuetify/lib'

type Query = firebase.firestore.Query

async function map<T = any>(q: Query) {
  return (await q.get()).docs.map((d) => d.data() as T)
}

@Component({})
export default class Stats extends Vue {
  startModal = false
  start = null
  endModal = false
  end = null

  loaded = false

  users: any[] = []
  checkins: ICheckin[] = []
  events: IEvent[] = []

  $refs!: {
    startDialog: any
    endDialog: any
  }

  get uniqueCheckins() {
    return [...new Set(this.checkins.map((c) => c.user))]
  }

  get sum() {
    const s = this.uniqueCheckins.length * 200
    if (s < 4000) return 4000
    if (s > 8000) return 8000
    return s
  }

  async load() {
    const {start, end} = this

    if (!start || !end) return

    this.loaded = false
    this.users = await map(
      db
        .collection('users')
        .where('registerAt', '>=', moment(start).toDate())
        .where('registerAt', '<=', moment(end).toDate()),
    )
    this.checkins = await map<ICheckin>(
      db
        .collection('checkins')
        .where('accepted', '==', true)
        .where('createdAt', '>=', moment(start).toISOString())
        .where('createdAt', '<=', moment(end).toISOString()),
    )
    this.events = await map<IEvent>(
      db
        .collection('events')
        .where('createdAt', '>=', moment(start).toISOString())
        .where('createdAt', '<=', moment(end).toISOString()),
    )
    this.loaded = true
  }
}
</script>

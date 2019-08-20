<template>
  <v-layout column>
    <portal v-if="date && active" to="header">
      <v-app-bar app>
        <v-app-bar-nav-icon>
          <back-button />
        </v-app-bar-nav-icon>
        <v-toolbar-title>{{ dateText }}</v-toolbar-title>
      </v-app-bar>
    </portal>
    <v-layout column v-if="items" :style="{position: 'relative'}" v-scroll="checkScroll">
      <template v-if="active">
        <portal v-if="smallScreens" to="header-right">
          <v-row no-gutters justify="end">
            <v-btn outlined color="success" @click="menu = true" class="pl-3 pr-3">Календарь</v-btn>
          </v-row>
          <v-dialog v-model="menu" width="300px">
            <date-picker :current="date ? start : undefined" v-slot="{date}">
              <v-btn text @click="menu = false">Отмена</v-btn>
              <v-spacer></v-spacer>
              <v-btn :disabled="!date" text color="primary" @click="setDate(date)">Найти</v-btn>
            </date-picker>
          </v-dialog>
        </portal>
        <portal v-else to="main-right">
          <v-card :style="{position: 'fixed'}" max-width="250px" class="ml-3 mr-3">
            <date-picker :current="date ? start : undefined" @change="setDate" />
          </v-card>
        </portal>
      </template>

      <v-card v-if="!items.length" class="mt-3">
        <v-card-text>Событий нет :(</v-card-text>
      </v-card>

      <template v-for="i in items">
        <Item v-if="i" :key="i.uid" :item="i" :possible-events="events" short class="mb-4" />
      </template>
    </v-layout>
    <v-progress-circular class="align-self-center" v-if="loading" indeterminate />
  </v-layout>
</template>

<script lang="ts">
import moment from 'moment'
import {firestore} from 'firebase'
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {Location} from 'vue-router'

import db, {IEvent} from '@/db'
import {getItems, IGroup, IPost} from '@/vk'

import Item from '@/components/Item.vue'
import DatePicker from '@/components/DatePicker.vue'
import Post from '@/components/Post.vue'
import BackButton from '@/components/BackButton.vue'

type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot

@Component({
  components: {Post, Item, DatePicker, BackButton},
})
export default class List extends Vue {
  @Prop({required: false}) private readonly date!: string

  loading = false
  events: IEvent[] = []
  items: Array<IPost | IGroup> | null = null
  last: QueryDocumentSnapshot | null = null
  portion = 15

  promote = null

  menu = false
  active = true

  get smallScreens() {
    return this.$vuetify.breakpoint.smAndDown
  }

  activated() {
    this.active = true
  }

  deactivated() {
    this.active = false
  }

  @Watch('date', {immediate: true})
  onDateChange() {
    this.load()
  }

  get dateText() {
    if (!this.date) return 'скоро'
    let m = moment(this.date)
    if (m.isSame(moment(), 'day')) return 'сегодня'
    if (m.isSame(moment().add(1, 'day'), 'day')) return 'завтра'
    return m.format('D MMM')
  }

  get start() {
    return this.date ? moment(this.date).startOf('day') : moment().subtract(25, 'minutes')
  }

  get end() {
    const limit = this.date ? 1 : 1000
    return moment(this.start)
      .add(limit, 'day')
      .startOf('day')
  }

  query() {
    return db
      .collection('events')
      .orderBy('start', 'asc')
      .where('start', '>=', this.start.toISOString())
      .where('start', '<', this.end.toISOString())
  }

  async load(more = false) {
    if (this.loading || (more && !this.last)) return

    let loadPromotes

    if (!more) {
      this.items = null
      this.events = []
      loadPromotes = db.collection('promotes').get()
    }
    this.loading = true

    let q = this.query()
    if (more) q = q.startAfter(this.last)

    const events = await q.limit(this.portion).get()
    this.last = events.docs[events.docs.length - 1]

    let ev = events.docs.map(d => ({...d.data(), uid: d.id} as IEvent))
    if (this.events) ev = ev.filter(e => !this.events.find(ev => ev.id === e.id))

    let items: IEvent[] = []
    let lasts: Record<string, IEvent> = {}
    for (let e of ev) {
      if (!items.find(pe => pe.id === e.id)) items.push(e)
      lasts[e.id] = e
    }
    if (loadPromotes) {
      const promotes = (await loadPromotes).docs.map(
        d =>
          ({
            ...d.data(),
            uid: d.id,
          } as IEvent),
      )
      const promote = promotes[Math.round(Math.random() * (promotes.length - 1))]
      if (promote) items.splice(Math.min(items.length, 2), 0, promote)
    }

    this.events.push(...ev)
    this.items = (this.items || []).concat(
      (await getItems(items.map(e => e.id))).flatMap(i => (i ? [i] : [])),
    )
    this.loading = false

    for (let e of Object.values(lasts))
      this.events.push(
        ...(await this.query()
          .where('start', '>', e.start)
          .where('id', '==', e.id)
          .get()).docs.map(d => ({...d.data(), uid: d.id} as IEvent)),
      )
  }

  checkScroll() {
    if (document.body.scrollHeight - scrollY < innerHeight * 2) this.load(true)
  }

  setDate(date: string) {
    this.menu = false
    this.go({
      name: 'list',
      query: {
        date,
      },
    })
  }

  go(opt: Location) {
    !this.date ? this.$router.push(opt) : this.$router.replace(opt)
  }
}
</script>

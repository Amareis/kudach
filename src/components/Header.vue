<template>
  <source-name :id="sourceId" :subtitles="main">
    <v-list-item-action>
      <v-menu offset-y ref="menu">
        <template #activator="{on}">
          <v-btn v-on="on" @click.native.prevent="" icon large>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list v-scroll="$refs.menu && $refs.menu.save" subheader>
          <v-list-item @click="show = true">
            <v-list-item-title>Список событий</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="canOpen" :to="'/e/' + id">
            <v-list-item-title>Открыть</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list-item-action>

    <v-dialog v-model="show" max-width="500" scrollable>
      <v-card>
        <v-list dense>
          <template v-for="(e, i) of sorted">
            <v-list-item :key="i">
              <v-list-item-content>
                <v-list-item-title>{{ date(e.start) }} в {{ time(e.start) }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="i + 'div'" />
          </template>
        </v-list>
      </v-card>
    </v-dialog>
  </source-name>
</template>

<script lang="ts">
import moment from 'moment'
import {Component, Prop, Vue} from 'vue-property-decorator'

import {IEvent} from '@/db'

import SourceName from './SourceName.vue'

const timeFormat = {
  lastDay: '[вчера]',
  sameDay: '[сегодня]',
  nextDay: '[завтра]',
  lastWeek: '[в] dddd',
  nextWeek: '[в] dddd',
  sameElse: 'L (dd)',
}

function inFuture(e: IEvent) {
  const now = moment().subtract(25, 'minutes')
  return moment(e.start) > now
}

@Component({
  components: {SourceName},
})
export default class Header extends Vue {
  @Prop() private readonly id!: string
  @Prop() private readonly sourceId!: number
  @Prop() private readonly canOpen!: boolean
  @Prop() private readonly events!: IEvent[]

  show = false

  get sorted() {
    return [...this.events].sort(
      (e1, e2) => (new Date(e1.start) as any) - (new Date(e2.start) as any),
    )
  }

  get next() {
    return this.sorted.find(inFuture)
  }

  get createdAt() {
    const start = this.sorted[0]
    return moment(start && start.createdAt).format('L (dd) HH:mm')
  }

  get main() {
    const l = this.events.length
    if (l === 0) return ['Когда-то']
    if (l === 1) return [(this.next ? '' : 'Было ') + this.format(this.events[0])]
    if (!this.next) return ['Было ' + l + ' событий']
    const f = this.format(this.next)
    let s
    if (l === 2) {
      const sec = this.events.find(e => e !== this.next)!
      s = (inFuture(sec) ? '(также ' : '(было ') + this.format(sec) + ')'
    } else s = '(и ещё ' + (l - 1) + ' событий)'
    if (this.$vuetify.breakpoint.xsOnly) return [f, s]
    return [f + ' ' + s]
  }

  date(m: string) {
    return moment(m).calendar(undefined, timeFormat)
  }

  time(m: string) {
    return moment(m).format('HH:mm')
  }

  format(m: IEvent) {
    return this.date(m.start) + ' в ' + this.time(m.start)
  }
}
</script>

<template>
  <v-card :tile="$vuetify.breakpoint.xs">
    <v-row no-gutters>
      <v-col>
        <Header :id="id" :source-id="sourceId" :events="events" :can-open="short" />
      </v-col>
    </v-row>

    <v-card-text class="post pt-2 pb-2"
      >{{ cardText
      }}<span v-if="short && !expanded" @click="expand" class="more"
        >{{ '\n' }}Показать полностью...</span
      ></v-card-text
    >

    <v-img
      v-if="image"
      :key="imageLoaded"
      max-height="500px"
      contain
      lazy-src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
      :src="image.url"
      :aspect-ratio="imageLoaded ? undefined : ratio"
      @load="imageLoaded = true"
    />

    <v-card-actions class="actions" v-if="events.length">
      <v-layout>
        <fave-button :id="id" />
      </v-layout>
      <v-layout justify-center>
        <v-btn
          text
          color="info"
          :href="'https://vk.com/' + (isGroup ? 'club' + Math.abs(sourceId) : 'wall' + id)"
          target="_blank"
          >{{ isGroup ? 'Событие ВК' : 'Пост ВК' }}</v-btn
        >
      </v-layout>
      <v-layout justify-end>
        <checkin-button :id="id" />
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {IEvent} from '@/db'
import {IPhotoSize} from '@/vk'

import Header from './Header.vue'
import FaveButton from './FaveButton.vue'
import CheckinButton from './CheckinButton.vue'

const len = 150

@Component({
  components: {Header, FaveButton, CheckinButton},
})
export default class Card extends Vue {
  @Prop() private readonly id!: string
  @Prop() private readonly sourceId!: number
  @Prop({default: false}) private readonly isGroup!: boolean
  @Prop({default: false}) private readonly short!: boolean
  @Prop() private readonly text!: string
  @Prop() private readonly events!: IEvent[]
  @Prop() private readonly images!: IPhotoSize[]

  expanded = !this.short || this.text.length <= len
  imageLoaded = false
  dialog = false

  expand() {
    this.expanded = !this.expanded
    if (!this.expanded) {
      let x = document.body.clientHeight - document.documentElement.scrollTop - innerHeight
      this.$nextTick(
        () => (document.documentElement.scrollTop = document.body.clientHeight - innerHeight - x),
      )
    }
  }

  get image() {
    return this.images[0]
  }

  get ratio() {
    if (!this.image || !this.image.width || !this.image.height) return 1
    return this.image.width / this.image.height
  }

  get cardText() {
    if (this.expanded || this.text.length <= len) return this.text
    return this.text.slice(0, len - 3) + '...'
  }
}
</script>

<style scoped>
.post {
  white-space: pre-wrap;
  word-break: break-word;
  color: black !important;

  & .more {
    opacity: 0.9;
    font-weight: 500;
    -webkit-font-smoothing: subpixel-antialiased;
    cursor: pointer;
    color: #42648b;
  }
}
.actions {
  & > * {
    flex-basis: 0
  }
}
</style>

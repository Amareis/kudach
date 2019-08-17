<template>
  <v-flex v-bind="$attrs">
    <v-card :tile="$vuetify.breakpoint.xs">
      <v-flex class="pt-2">
        <Header :id="id" :source-id="sourceId" :events="events" :can-open="short" />
      </v-flex>

      <v-card-text class="post"
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

      <v-card-actions>
        <v-btn
          text
          small
          color="info"
          :href="'https://vk.com/' + (isGroup ? 'club' + Math.abs(sourceId) : 'wall' + id)"
          target="_blank"
          >{{ isGroup ? 'Событие ВК' : 'Пост ВК' }}</v-btn
        >
        <v-spacer />
        <v-dialog v-model="dialog" width="500">
          <template v-slot:activator="{on}">
            <v-btn small text color="primary" v-on="on">Найти компанию</v-btn>
          </template>

          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title
              >Поиск компании</v-card-title
            >

            <v-card-text>
              Интересное событие, из знакомых там никого, а в одиночку идти не хочется? Заходи в
              <a href="https://vk.me/join/AJQ1d7md7RBykbZdRMSh/If7" target="_blank"
                >наш чат ВКонтакте</a
              >, там найдёшь компанию для совместного похода на мероприятие :)
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-btn text @click="dialog = false">
                Закрыть
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                text
                href="https://vk.me/join/AJQ1d7md7RBykbZdRMSh/If7"
                target="_blank"
              >
                Открыть чат
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {IEvent} from '@/db'
import {IPhotoSize} from '@/vk'

import Header from './Header.vue'

const len = 150

@Component({
  components: {Header},
  inheritAttrs: false,
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

<style scoped lang="stylus">
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
</style>

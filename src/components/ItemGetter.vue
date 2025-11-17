<template>
  <v-text-field
    v-model="url"
    :error="!!error"
    label="Ссылка на пост или событие ВК"
    :messages="error"
    @blur="checkPost"
    @keydown.enter="checkPost"
    clearable
    @click:clear="clear"
  >
    <template #append-outer>
      <v-btn text small color="primary" class="ma-0" @click="paste">Вставить</v-btn>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {getGroups, getPosts} from '@/vk'
import db from '@/db'

const idRe = /(?:vk\.com\/|w=)wall([-_\d]+)/
function getId(url: string) {
  const m = idRe.exec(url)
  return m && m[1]
}

const gidRe = /vk\.com\/([^/]+)/
const partsRe = /^(?:club|public|event)(\d+)/
function getGroupId(url: string) {
  const m = gidRe.exec(url)
  const r = m && m[1]
  if (!r) return
  const m1 = partsRe.exec(r)
  return m1 ? m1[1] : r
}

function initialState() {
  return {
    url: '',
    error: '',
  }
}

@Component
export default class ItemGetter extends Vue {
  @Prop() private readonly collection!: string

  url = ''
  error = ''

  clear() {
    this.url = ''
    this.error = ''
    this.$emit('item', null)
    this.$emit('exist', false)
  }

  async checkPost() {
    if (!this.url) {
      this.clear()
      return
    }
    let id = getId(this.url)
    if (!id) {
      this.checkGroup()
      return
    }
    try {
      let post = (await getPosts(id))[0]
      if (!post) {
        this.error = 'Пост не найден'
        return
      }
      if (post.copy_history) post = post.copy_history[post.copy_history.length - 1]
      id = post.owner_id + '_' + post.id
      if (await this.exist(id)) {
        this.error = 'Такой пост уже есть!'
        this.$emit('exist', id)
        return
      }
      this.$emit('item', post)
    } catch (e) {
      this.error = 'Произошла ошибка'
      return
    }
    this.error = ''
  }

  async checkGroup() {
    let id = getGroupId(this.url)
    if (!id) {
      this.error = 'Неправильная ссылка'
      return
    }
    try {
      let group = (await getGroups(id, true))[0]
      if (!group) {
        this.error = 'Группа не найдена'
        return
      }
      id = String(-group.id)
      if (await this.exist(id)) {
        this.error = 'Эта встреча уже есть!'
        this.$emit('exist', id)
        return
      }
      this.$emit('item', group)
    } catch (e) {
      this.error = 'Произошла ошибка'
      return
    }
    this.error = ''
  }

  async exist(id: string) {
    let existing = await db.collection(this.collection).where('id', '==', id).limit(1).get()
    return !!existing.docs.length
  }

  async paste() {
    this.clear()
    try {
      this.url = await navigator.clipboard.readText()
      this.checkPost()
    } catch (e) {
      /*ok*/
    }
  }
}
</script>

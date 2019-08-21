<template>
  <v-layout column>
    <div v-if="error" class="error">{{ error }}</div>
    <Preview v-if="item" :item="item" />
  </v-layout>
</template>

<script>
import {getPosts, getGroups} from '@/vk'

import Preview from '../components/Preview'

export default {
  name: 'Edit',
  components: {Preview},
  props: {
    id: String,
  },
  data() {
    return {
      item: null,
      error: '',
    }
  },
  async created() {
    try {
      if (this.id.includes('_')) this.item = (await getPosts(this.id))[0]
      else this.item = (await getGroups(Math.abs(Number(this.id))))[0]
      if (!this.item) {
        this.error = 'Не найдено!'
        return
      }
    } catch (e) {
      this.error = 'Произошла ошибка'
      // eslint-disable-next-line no-console
      console.error(e)
      return
    }
    this.error = ''
  },
}
</script>

<style scoped></style>

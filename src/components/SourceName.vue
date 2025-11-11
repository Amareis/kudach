<template>
  <v-list class="pa-0" two-line>
    <v-list-item :href="noLink ? undefined : link" target="_blank">
      <v-list-item-avatar color="#DDD" class="mt-1 mb-1 mr-3">
        <img v-if="avatar" :src="avatar" />
        <v-icon v-else>mdi-account-multiple</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title class="name">{{ name }}</v-list-item-title>
        <v-list-item-subtitle v-for="t in subtitles" :key="t">{{ t }}</v-list-item-subtitle>
      </v-list-item-content>

      <slot />
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import {getGroups, getUsers} from '@/vk'

@Component
export default class SourceName extends Vue {
  @Prop() private readonly id!: number
  @Prop({default: () => []}) private readonly subtitles!: string[]
  @Prop({default: false}) private readonly noLink!: boolean

  avatar = ''
  name = ''

  created() {
    this.load()
  }

  get link() {
    return 'https://vk.com/' + (this.id < 0 ? 'club' : 'id') + Math.abs(this.id)
  }

  async load() {
    const isUser = this.id > 0
    if (isUser) {
      const [u] = await getUsers(String(this.id))
      if (u) {
        this.name = u.first_name + ' ' + u.last_name
        this.avatar = u.photo_50
      }
    } else {
      const [g] = await getGroups(String(-this.id))
      if (g) {
        this.name = g.name
        this.avatar = g.photo_50
      }
    }
  }
}
</script>

<style scoped>
.name {
  font-size: 15px;
  font-weight: 500;
  -webkit-font-smoothing: subpixel-antialiased;
  color: #2a5885;
}
</style>

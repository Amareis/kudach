<template>
  <v-card v-if="!hidden">
    <v-row no-gutters>
      <v-col>
        <source-name :id="checkin.user" />
      </v-col>
    </v-row>

    <v-carousel>
      <v-carousel-item v-for="i in images" :src="i" :key="i" contain />
    </v-carousel>
    <v-divider />

    <v-card-actions>
      <v-btn color="error" text @click="accept(false)"> Отклонить </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="info" text @click="dialog = true"> Событие </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="success" text @click="accept(true)"> Принять </v-btn>
    </v-card-actions>

    <v-dialog v-model="dialog" max-width="500px">
      <item-loader :id="checkin.id" short />
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import db, {storage, ICheckin} from '@/db'
import SourceName from '@/components/SourceName.vue'
import ItemLoader from '@/components/ItemLoader.vue'
import {auth} from '@/store'

@Component({
  components: {ItemLoader, SourceName},
})
export default class CheckinEdit extends Vue {
  @Prop() private readonly checkin!: ICheckin

  images: string[] = []

  dialog = false
  hidden = false

  async created() {
    await Promise.all(this.checkin.photos.map(this.getUrl))
  }

  get uid() {
    return this.checkin.user + '_' + this.checkin.id
  }

  async getUrl(photo: string) {
    this.images.push(await storage.ref(photo).getDownloadURL())
  }

  async accept(accept: boolean) {
    await db
      .collection('checkins')
      .doc(this.uid)
      .update('accepted', accept, 'acceptedBy', auth.user!.id)
    this.hidden = true
  }
}
</script>

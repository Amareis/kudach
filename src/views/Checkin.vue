<template>
  <v-layout column>
    <portal to="header">
      <v-app-bar app>
        <v-app-bar-nav-icon>
          <back-button />
        </v-app-bar-nav-icon>
        <v-toolbar-title>Чекин на событии</v-toolbar-title>
      </v-app-bar>
    </portal>

    <v-layout v-if="loading" justify-center><v-progress-circular indeterminate/></v-layout>
    <v-card v-else>
      <v-card-title primary-title>Ваши фотографии</v-card-title>

      <v-card-text v-if="images.length">
        {{ status }}
      </v-card-text>

      <v-carousel v-if="images.length">
        <v-carousel-item v-for="i in images" :src="i" :key="i" contain />
      </v-carousel>
      <v-card-text v-else>
        Загрузите фотографии с события
      </v-card-text>

      <v-divider />

      <v-card-actions v-if="!check || check.accepted === null">
        <v-spacer></v-spacer>
        <upload-button
          color="primary"
          multiple
          accept="image/*"
          :loading="uploading"
          @file-update="upload"
        >
          Добавить фотографии
        </upload-button>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import moment from 'moment'

import BackButton from '@/components/BackButton.vue'
import UploadButton from '@/components/UploadButton.vue'

import db, {firebase, storage, ICheckin} from '@/db'
import {auth} from '@/store'

@Component({
  components: {BackButton, UploadButton},
})
export default class Checkin extends Vue {
  @Prop() private readonly id!: string

  loading = true
  check: ICheckin | null = null

  uploading = false

  images: string[] = []

  get user() {
    return auth.user!
  }

  async created() {
    await this.get()
    if (this.check) await Promise.all(this.check.photos.map(this.getUrl))
    this.loading = false
  }

  get uid() {
    return this.user.id + '_' + this.id
  }

  get status() {
    if (!this.check) return ''
    if (this.check.accepted === null) return 'Идёт проверка, скоро ваши фотографии подтвердят!'
    if (this.check.accepted === false) return 'Ваши фотографии отклонены :('
    return 'Фотографии подтверждены'
  }

  async get() {
    let doc = await db
      .collection('checkins')
      .doc(this.uid)
      .get()

    if (doc.exists) this.check = doc.data() as ICheckin
    else this.check = null
  }

  async create() {
    let doc = db.collection('checkins').doc(this.uid)
    await doc.set({
      id: this.id,
      user: this.user.id,
      createdAt: moment().toISOString(),
      accepted: null,
      photos: [],
    })
    this.check = (await doc.get()).data() as ICheckin
  }

  async add(photo: string) {
    let doc = db.collection('checkins').doc(this.uid)
    await doc.update('photos', firebase.firestore.FieldValue.arrayUnion(photo))
    await this.getUrl(photo)
    this.check = (await doc.get()).data() as ICheckin
  }

  async getUrl(photo: string) {
    this.images.push(await storage.ref(photo).getDownloadURL())
  }

  async upload(photos: File[]) {
    this.uploading = true
    let count = 0
    if (this.check) count = this.check.photos.length
    for (let file of photos) {
      let name = `checkins/${this.user.id}/${this.id}_${count}.${file.name.split('.').pop()}`
      let f = storage.ref(name)
      await f.put(file)
      if (!this.check) await this.create()
      await this.add(name)
      count++
    }
    this.uploading = false
  }
}
</script>

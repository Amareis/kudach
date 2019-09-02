<template>
  <v-layout column>
    <v-card>
      <v-list v-if="!creating">
        <v-list-item @click="creating = true">
          <v-list-item-action>
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Добавить...</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-else>
        <v-card-actions>
          <item-getter collection="promotes" @item="item = $event" @exist="existing = $event" />
        </v-card-actions>
        <v-card-actions> </v-card-actions>
      </template>
    </v-card>
    <v-card v-if="existing">
      <v-card-text color="red">
        Этот пост уже продвигается!
      </v-card-text>
    </v-card>
    <Preview v-if="item" :item="item" only-frame class="mt-3">
      <v-card slot-scope="{id}">
        <v-card-actions>
          <v-btn @click="cancel()" text color="red">Отмена</v-btn>
          <v-spacer />
          <v-btn @click="create(id)" text color="success">
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </Preview>
    <template v-for="e in events" :item="e">
      <v-card :key="e.uid" class="mt-3">
        <v-card-actions>
          <v-spacer />
          <v-btn @click="del(e.uid)" text color="red">Удалить</v-btn>
        </v-card-actions>
      </v-card>
      <item-loader :key="e.uid + 'frame'" :id="e.id" />
    </template>
  </v-layout>
</template>

<script>
import moment from 'moment'
import db, {auth} from '@/db'

import ItemLoader from '@/components/ItemLoader'

import ItemGetter from '../../components/ItemGetter'
import Preview from '../components/Preview'

export default {
  name: 'Promotes',
  components: {ItemGetter, Preview, ItemLoader},
  props: {},
  data() {
    return {
      events: [],
      creating: false,
      item: null,
      existing: false,
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.events = (await db.collection('promotes').get()).docs.map(d => ({
        ...d.data(),
        uid: d.id,
      }))
    },
    cancel() {
      this.creating = this.item = this.existing = false
    },
    async create(id) {
      const e = {
        id,
        createdAt: moment().toISOString(),
        user: auth.currentUser.uid,
      }
      this.cancel()
      await db.collection('promotes').add(e)
      this.load()
    },
    async del(uid) {
      await db
        .collection('promotes')
        .doc(uid)
        .delete()
      this.load()
    },
  },
}
</script>

<style scoped></style>

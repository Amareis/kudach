<template>
  <v-card>
    <v-card-actions class="pb-0 pt-0">
      <date-time v-model="start" />
    </v-card-actions>
    <v-card-actions v-if="start && !event" class="pt-0">
      <check-time :time="start" />
    </v-card-actions>
    <v-card-actions>
      <v-btn @click="$emit('cancel')" text color="red">Отмена</v-btn>
      <v-spacer />
      <v-btn
        :disabled="!start"
        :loading="creating"
        @click="event ? edit() : create()"
        text
        color="success"
      >
        {{ event ? 'Изменить' : 'Создать' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'

import db, {auth} from '@/db'

import DateTime from './DateTime'
import CheckTime from './CheckTime'

export default {
  name: 'CreateEvent',
  components: {DateTime, CheckTime},
  props: {
    id: String,
    event: {
      type: Object,
      required: false,
    },
  },
  data() {
    const e = this.event
    return {
      start: e ? e.start : '',
      creating: false,
    }
  },
  methods: {
    async create() {
      this.creating = true
      const e = {
        id: this.id,
        createdAt: moment().toISOString(),
        start: this.start,
        user: auth.currentUser.uid,
        kind: 'common',
      }
      await db.collection('events').add(e)
      this.$emit('created')
    },
    async edit() {
      this.creating = true
      await db
        .collection('events')
        .doc(this.event.uid)
        .update({
          start: this.start,
        })
      this.$emit('edited')
    },
  },
}
</script>

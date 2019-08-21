<template>
  <v-layout>
    <v-flex xs7>
      <v-dialog
        ref="dialog"
        v-model="modal"
        :return-value.sync="date"
        persistent
        full-width
        width="290px"
      >
        <template #activator="{ on }">
          <v-text-field
            v-on="on"
            :value="date && format(date)"
            class="mr-2"
            label="Дата"
            prepend-icon="mdi-calendar"
            readonly
          ></v-text-field>
        </template>
        <v-date-picker v-model="date" :first-day-of-week="1" locale="ru-RU" full-width>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="modal = false">Отмена</v-btn>
          <v-btn text color="primary" @click="$refs.dialog.save(date)">OK</v-btn>
        </v-date-picker>
      </v-dialog>
    </v-flex>
    <v-flex xs5>
      <v-dialog
        ref="dialog2"
        v-model="modal2"
        :return-value.sync="time"
        persistent
        full-width
        width="290px"
        @input="value => value && $refs.picker && ($refs.picker.selectingHour = true)"
      >
        <template #activator="{ on }">
          <v-text-field
            v-model="time"
            label="Время"
            prepend-icon="mdi-clock-outline"
            readonly
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker ref="picker" v-model="tempTime" full-width format="24hr">
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="modal2 = false">Отмена</v-btn>
          <v-btn text color="primary" @click="$refs.dialog2.save(tempTime)">OK</v-btn>
        </v-time-picker>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'

const timeFormat = {
  lastDay: 'L (dd)',
  sameDay: 'L (dd)',
  nextDay: 'L (dd)',
  lastWeek: 'L (dd)',
  nextWeek: 'L (dd)',
  sameElse: 'L (dd)',
}

export default {
  name: 'DateTime',
  components: {},
  props: {
    value: String,
  },
  data() {
    return {
      modal: false,
      modal2: false,
      tempTime: '19:00',
      date: this.value ? moment(this.value).format('YYYY-MM-DD') : '',
      time: this.value ? moment(this.value).format('HH:mm') : '',
    }
  },
  computed: {
    start() {
      if (!this.time || !this.date) return ''
      const [h, m] = this.time.split(':')
      return moment(this.date)
        .set({h, m})
        .toISOString()
    },
  },
  watch: {
    start() {
      this.$emit('input', this.start)
    },
  },
  methods: {
    format(m) {
      return moment(m).calendar(null, timeFormat)
    },
  },
}
</script>

<style scoped lang="scss"></style>

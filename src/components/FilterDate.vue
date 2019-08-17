<template>
  <v-date-picker
    :value="date || start"
    @input="change"
    :full-width="fullWidth"
    :first-day-of-week="1"
    locale="ru-RU"
    no-title
    width="230px"
  >
    <template v-if="fullWidth">
      <v-spacer></v-spacer>
      <v-btn :disabled="!date" text color="primary" @click="filterDate(date)">Найти</v-btn>
    </template>
  </v-date-picker>
</template>

<script lang="ts">
import moment, {Moment} from 'moment'
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component
export default class FilterDate extends Vue {
  @Prop({required: false}) private readonly current!: Moment
  @Prop({default: false}) private readonly fullWidth!: boolean

  date: string | null = null

  get start() {
    if (!this.current) return undefined
    return this.current.format('YYYY-MM-DD')
  }

  change(date: string) {
    if (this.fullWidth) this.date = date
    else if (date !== this.start) this.filterDate(date)
  }

  filterDate(date: string) {
    this.$emit('filter', date && moment(date).format('YYYY-MM-DD'))
  }
}
</script>

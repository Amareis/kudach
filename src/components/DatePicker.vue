<template>
  <v-date-picker
    :value="date || start"
    @input="change"
    :first-day-of-week="1"
    locale="ru-RU"
    no-title
    width="auto"
  >
    <slot :date="date" />
  </v-date-picker>
</template>

<script lang="ts">
import moment, {Moment} from 'moment'
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component
export default class DatePicker extends Vue {
  @Prop({required: false}) private readonly current!: Moment

  date: string | null = null

  get start() {
    if (!this.current) return undefined
    return this.current.format('YYYY-MM-DD')
  }

  change(date: string) {
    date = moment(date).format('YYYY-MM-DD')
    if (date !== this.start) {
      this.date = date
      this.$emit('change', date)
    }
  }
}
</script>

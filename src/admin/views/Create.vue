<template>
  <v-layout column>
    <v-flex class="pl-2 pr-2">
      <item-getter collection="events" @item="item = $event" @exist="existing = $event" />
    </v-flex>
    <v-btn v-if="existing" class="success" :to="{name: 'edit', params: {id: existing}}"
      >Редактировать</v-btn
    >
    <Preview v-if="item" :item="item" />
  </v-layout>
</template>

<script>
import ItemGetter from '../components/ItemGetter'
import Preview from '../components/Preview'

export default {
  name: 'Create',
  components: {ItemGetter, Preview},
  data() {
    return {
      item: null,
      existing: false,
    }
  },
  methods: {},
}
</script>

<style scoped></style>

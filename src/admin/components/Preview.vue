<template>
  <v-layout column>
    <Events v-if="!onlyFrame" :id="id" edit />
    <slot :id="id" />
    <item-loader :id="id" short />
  </v-layout>
</template>

<script>
import Events from './Events'
import ItemLoader from '../../components/ItemLoader'

export default {
  name: 'Preview',
  components: {Events, ItemLoader},
  props: {
    item: Object,
    onlyFrame: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isPost() {
      return !!this.item.owner_id
    },
    id() {
      return this.isPost ? this.item.owner_id + '_' + this.item.id : String(-this.item.id)
    },
  },
}
</script>

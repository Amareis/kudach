<template>
  <v-card v-if="!hidden">
    <v-row no-gutters>
      <v-col>
        <source-name :id="propose.user" />
      </v-col>
    </v-row>

    <template v-if="canEdit">
      <Events :id="propose.id" edit @change="events = $event.length" />
      <v-card-actions>
        <v-btn color="error" text @click="accept(false)">
          Отклонить
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" text :disabled="events === 0" @click="accept(true)">
          Принять
        </v-btn>
      </v-card-actions>
    </template>

    <item-loader :id="propose.id" short />
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

import db, {IProposed} from '@/db'
import {auth} from '@/store'

import SourceName from '@/components/SourceName.vue'
import ItemLoader from '@/components/ItemLoader.vue'
import Events from '@/admin/components/Events.vue'

@Component({
  components: {ItemLoader, SourceName, Events},
})
export default class CheckinEdit extends Vue {
  @Prop() private readonly propose!: IProposed

  events: number = 0

  hidden = false

  get canEdit() {
    return auth.isAdmin
  }

  async accept(accepted: boolean) {
    await db
      .collection('proposed')
      .doc(this.propose.id)
      .update('accepted', accepted, 'acceptedBy', auth.user!.id)
    this.hidden = true
  }
}
</script>

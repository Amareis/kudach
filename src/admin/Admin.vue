<template>
  <v-layout>
    <portal to="header-title">Админка</portal>
    <v-navigation-drawer
      v-if="$vuetify.breakpoint.smAndDown"
      temporary
      v-model="drawer"
      fixed
      right
    >
      <admin-nav-list />
    </v-navigation-drawer>
    <portal v-if="$vuetify.breakpoint.smAndDown" to="header-right">
      <v-row no-gutters justify="end">
        <v-btn text @click="drawer = true"> Меню </v-btn>
      </v-row>
    </portal>
    <portal v-else to="main-right">
      <v-card max-width="200px" :style="{position: 'fixed'}" class="ml-3 mr-3">
        <v-navigation-drawer floating permanent>
          <admin-nav-list />
        </v-navigation-drawer>
      </v-card>
    </portal>
    <router-view />
  </v-layout>
</template>

<script>
import AdminNavList from './AdminNavList.vue'
export default {
  name: 'Admin',
  components: {AdminNavList: AdminNavList},
  data() {
    return {
      drawer: null,
    }
  },
}
</script>

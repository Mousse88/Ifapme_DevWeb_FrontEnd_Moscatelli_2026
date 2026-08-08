<template>
  <v-app>
    <Header />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Header from '@/components/header.vue'
import { useEcoleStore } from '@/stores/ecole'

const store = useEcoleStore()

onMounted(async () => {
  await store.chargerCours()
  await store.chargerClasses()
  await store.chargerEleves()
  await store.chargerHoraires()
  await store.chargerInterros()
  await store.chargerNotes()
  await store.chargerEvenements()
})
</script>
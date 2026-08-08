<template>
  <PageLayout titre="Accueil">
    <v-row>
      <MiniCalendrier />
      <ProchainsEvenements />
      <HoraireDuJour />
      <DecompteConges />
      <AnniversaireDuJour />
    </v-row>
  </PageLayout>
</template>

<script setup lang="ts">
import PageLayout from '@/components/Pagelayout.vue'

import MiniCalendrier from '@/components/accueil/MiniCalendrier.vue'
import ProchainsEvenements from '@/components/accueil/ProchainsEvenements.vue'
import HoraireDuJour from '@/components/accueil/HoraireDuJour.vue'
import DecompteConges from '@/components/accueil/DecompteConges.vue'
import AnniversaireDuJour from '@/components/accueil/AnniversaireDuJour.vue'
</script>
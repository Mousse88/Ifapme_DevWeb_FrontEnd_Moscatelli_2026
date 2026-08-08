<template>
  <PageLayout titre="📋 Présences" sous-titre="Encodage et récapitulatif des présences">

    <v-tabs v-model="ongletActif" class="mb-6" color="success" @update:model-value="onChangementOnglet">
      <v-tab value="encoder">
        <v-icon class="mr-2">mdi-pencil-outline</v-icon>
        Encoder
      </v-tab>
      <v-tab value="recapitulatif">
        <v-icon class="mr-2">mdi-table</v-icon>
        Récapitulatif
      </v-tab>
    </v-tabs>

    <v-window v-model="ongletActif">
      <v-window-item value="encoder">
        <EncodagePresences ref="encodageRef" />
      </v-window-item>

      <v-window-item value="recapitulatif">
        <RecapitulatifPresences ref="recapRef" />
      </v-window-item>
    </v-window>

  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import PageLayout from '@/components/Pagelayout.vue'
import EncodagePresences from '@/components/presences/EncodagePresences.vue'
import RecapitulatifPresences from '@/components/presences/RecapitulatifPresences.vue'

const ongletActif = ref('encoder')
const encodageRef = ref<InstanceType<typeof EncodagePresences> | null>(null)
const recapRef = ref<InstanceType<typeof RecapitulatifPresences> | null>(null)

async function onChangementOnglet(nouvelOnglet: string) {
  if (nouvelOnglet === 'recapitulatif') {
    if (encodageRef.value) await encodageRef.value.enregistrer()
    if (recapRef.value) await recapRef.value.recharger()
  }
}
</script>
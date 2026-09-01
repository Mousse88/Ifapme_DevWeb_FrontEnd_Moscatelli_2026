<!--
  Page Paramètres : assemble les deux cartes de configuration
  (Année scolaire + Période active), avec un petit message de confirmation
  (snackbar) affiché après une action réussie.
-->
<template>
  <PageLayout titre="⚙️ Paramètres" sous-titre="Configuration de l'année scolaire et des périodes">

    <v-snackbar v-model="snackbarVisible" :timeout="3000" color="success" location="bottom right">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>

    <div class="grille-parametres">
      <CarteAnneeScolaire
        @nouvelle-annee="onNouvelleAnnee"
        @changer-annee="onChangerAnnee"
      />
      <CartePeriodeActive />
    </div>

  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEcoleStore } from '@/stores/ecole'

import PageLayout from '@/components/Pagelayout.vue'
import CarteAnneeScolaire from '@/components/parametres/CarteAnneeScolaire.vue'
import CartePeriodeActive from '@/components/parametres/CartePeriodeActive.vue'

const store = useEcoleStore()

const snackbarVisible = ref(false)
const snackbarMessage = ref('')

// Nouvelle année démarrée → recharger les données (vierges pour la nouvelle année)
async function onNouvelleAnnee() {
  try {
    await store.rechargerTout()
    snackbarMessage.value = 'Nouvelle année démarrée ! Les données précédentes sont conservées.'
    snackbarVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

// Changement d'année consultée → recharger les données de l'année sélectionnée
async function onChangerAnnee() {
  try {
    await store.rechargerTout()
    snackbarMessage.value = `Données chargées pour ${snackbarMessage.value}`
    snackbarVisible.value = true
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.grille-parametres {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media (max-width: 768px) {
  .grille-parametres { grid-template-columns: 1fr; }
}
</style>

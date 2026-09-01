<!--
  Page Cahier de cotes : orchestre les 3 étapes du parcours
  (1. choisir la classe, 2. choisir la période, 3. voir/éditer les cotes),
  en déléguant l'affichage de chaque étape à un sous-composant dédié.
-->
<template>
  <PageLayout titre="📝 Cahier de cotes" sous-titre="Gestion des résultats par classe et par période">
    <SelectionClasseCahier
      :classes="store.classes"
      :classe-selectionnee-id="classeSelectionneeId"
      :obtenir-nom-cours="obtenirNomCours"
      @selectionner-classe="selectionnerClasse"
    />

    <SelectionPeriode v-if="classeSelectionneeId" v-model="periodeSelectionnee" />

    <ZoneCoursCahier
      v-if="classeSelectionneeId"
      :classe-id="classeSelectionneeId"
      :periode="periodeSelectionnee"
      :cours="coursClasse"
      @retour-periode="periodeSelectionnee = 1"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEcoleStore } from '@/stores/ecole'

import PageLayout from '@/components/Pagelayout.vue'
import SelectionClasseCahier from '@/components/cahierCotes/SelectionClasseCahier.vue'
import SelectionPeriode from '@/components/cahierCotes/SelectionPeriode.vue'
import ZoneCoursCahier from '@/components/cahierCotes/ZoneCoursCahier.vue'

type PeriodeValeur = number | 'annuel'

const store = useEcoleStore()

const classeSelectionneeId = ref<number | null>(null)
const periodeSelectionnee = ref<PeriodeValeur>(1)

// Sélectionner une nouvelle classe réinitialise toujours la période à 1
// (on ne garde pas la période de la classe précédente).
function selectionnerClasse(classeId: number) {
  classeSelectionneeId.value = classeId
  periodeSelectionnee.value = 1
}

const classeSelectionnee = computed(() =>
  store.classes.find(c => c.id === classeSelectionneeId.value)
)

// Les cours affichés dans la sélection sont uniquement ceux associés
// à la classe actuellement choisie.
const coursClasse = computed(() => {
  if (!classeSelectionnee.value) return []
  return store.obtenirCoursParIds(classeSelectionnee.value.coursIds)
})

// Convertit une liste d'ids de cours en texte lisible ("Maths, Français").
function obtenirNomCours(coursIds: number[]) {
  return store.cours.filter(c => coursIds.includes(c.id)).map(c => c.nom).join(', ')
}
</script>

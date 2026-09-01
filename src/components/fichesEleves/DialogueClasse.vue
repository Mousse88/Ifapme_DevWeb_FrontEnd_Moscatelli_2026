<!--
  Popup de création/modification d'une classe : son nom et les cours qui
  lui sont associés. Sert aussi bien pour créer une nouvelle classe que
  pour éditer une classe existante (classeEnEditionId détermine le mode).
-->
<template>
  <v-dialog
    :model-value="modeleOuvert"
    max-width="400"
    @update:model-value="$emit('update:modeleOuvert', $event)"
  >
    <v-card class="carte-dialogue">
      <v-card-title>
        {{ classeEnEditionId ? "Modifier la classe" : "Créer une classe" }}
      </v-card-title>

      <v-card-text>
        <v-text-field
          ref="champClasseRef"
          v-model="classeLocale.nom"
          label="Nom de la classe"
        />
        <v-select
          ref="selectionCoursRef"
          v-model="classeLocale.coursIds"
          :items="cours"
          item-title="nom"
          item-value="id"
          label="Cours associés"
          multiple
          chips
          @update:modelValue="fermerSelection"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <BoutonApp variante="secondary" @click="$emit('fermer')">Annuler</BoutonApp>
        <BoutonApp
          variante="primary"
          :disabled="!classeLocale.nom || !classeLocale.coursIds.length"
          @click="$emit('enregistrer', { nom: classeLocale.nom, coursIds: classeLocale.coursIds })"
        >
          {{ classeEnEditionId ? "Modifier" : "Créer" }}
        </BoutonApp>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import type { Cours } from '@/stores/ecole'
import BoutonApp from '@/components/BoutonApp.vue'

const proprietes = defineProps<{
  modeleOuvert: boolean
  classeEnEditionId: number | null
  nomClasse: string
  coursIds: number[]
  cours: Cours[]
}>()

defineEmits<{
  (e: 'update:modeleOuvert', valeur: boolean): void
  (e: 'fermer'): void
  (e: 'enregistrer', donnees: { nom: string; coursIds: number[] }): void
}>()

const champClasseRef = ref()
const selectionCoursRef = ref()

// Copie locale éditable des données de la classe (on ne modifie pas
// directement les props, qui viennent du parent/du store).
const classeLocale = reactive({
  nom: proprietes.nomClasse,
  coursIds: [...proprietes.coursIds],
})

// Réinitialise les valeurs à chaque ouverture du dialogue
// et remet le focus automatiquement sur le champ "nom".
watch(() => proprietes.modeleOuvert, (ouvert) => {
  if (ouvert) {
    classeLocale.nom = proprietes.nomClasse
    classeLocale.coursIds = [...proprietes.coursIds]
    nextTick(() => champClasseRef.value?.focus())
  }
})

// Referme automatiquement le menu déroulant du select multi-cours
// après une sélection, pour une meilleure ergonomie.
function fermerSelection() { selectionCoursRef.value?.blur() }
</script>

<style scoped>
</style>

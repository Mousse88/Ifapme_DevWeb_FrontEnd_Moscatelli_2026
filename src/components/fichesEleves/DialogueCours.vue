<!--
  Popup simple de création/modification d'un cours : un seul champ, le nom.
-->
<template>
  <v-dialog
    :model-value="modeleOuvert"
    max-width="400"
    @update:model-value="$emit('update:modeleOuvert', $event)"
  >
    <v-card class="carte-dialogue">
      <v-card-title>
        {{ coursEnEditionId ? "Modifier le cours" : "Créer un cours" }}
      </v-card-title>

      <v-card-text>
        <v-text-field v-model="coursLocal.nom" label="Nom du cours" autofocus />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <BoutonApp variante="secondary" @click="$emit('fermer')">Annuler</BoutonApp>
        <BoutonApp
          variante="primary"
          :disabled="!coursLocal.nom.trim()"
          @click="$emit('enregistrer', coursLocal.nom)"
        >
          {{ coursEnEditionId ? "Modifier" : "Créer" }}
        </BoutonApp>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BoutonApp from '@/components/BoutonApp.vue'

const proprietes = defineProps<{
  modeleOuvert: boolean
  coursEnEditionId: number | null
  nomCours: string
}>()

defineEmits<{
  (e: 'update:modeleOuvert', valeur: boolean): void
  (e: 'fermer'): void
  (e: 'enregistrer', nom: string): void
}>()

const coursLocal = reactive({ nom: '' })

// À l'ouverture : si on édite un cours existant, on pré-remplit avec son nom,
// sinon (création) on part d'un champ vide.
watch(() => proprietes.modeleOuvert, (ouvert) => {
  if (!ouvert) return
  coursLocal.nom = proprietes.coursEnEditionId ? proprietes.nomCours : ''
})

// Si le nom du cours en édition change côté parent (ex: rechargement),
// on garde le champ local synchronisé.
watch(() => proprietes.nomCours, (nouveauNom) => {
  if (proprietes.coursEnEditionId) coursLocal.nom = nouveauNom
})
</script>

<style scoped>

</style>

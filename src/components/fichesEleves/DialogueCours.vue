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

watch(() => proprietes.modeleOuvert, (ouvert) => {
  if (!ouvert) return
  coursLocal.nom = proprietes.coursEnEditionId ? proprietes.nomCours : ''
})

watch(() => proprietes.nomCours, (nouveauNom) => {
  if (proprietes.coursEnEditionId) coursLocal.nom = nouveauNom
})
</script>

<style scoped>

</style>
<!--
  Sélecteur de créneau pour l'encodage des présences : choix du jour,
  du numéro de cours (période) et de la date, avec un indicateur "cours
  en cours" si le créneau sélectionné correspond à l'heure actuelle.
-->
<template>
  <v-card class="mb-5" :class="estSombre ? 'carte-sombre' : 'carte-claire'" elevation="2">
    <v-card-text class="pa-5">

      <v-alert v-if="!horaireActif" type="warning" variant="tonal" border="start">
        Aucun horaire actif pour aujourd'hui. Vérifie les dates dans la section Horaires.
      </v-alert>

      <div v-else>
        <div class="grille-selection mb-4">
          <div>
            <label class="libelle-champ">Jour</label>
            <v-select
              :model-value="jourSelectionne"
              :items="joursDisponibles"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="$emit('update:jourSelectionne', $event)"
            />
          </div>

          <div>
            <label class="libelle-champ">Numéro du cours</label>
            <v-select
              :model-value="periodeSelectionnee"
              :items="periodesDisponibles"
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="!jourSelectionne"
              @update:model-value="$emit('update:periodeSelectionnee', $event)"
            />
          </div>

          <div>
            <label class="libelle-champ">Date</label>
            <v-text-field
              :model-value="dateSelectionnee"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
              :min="horaireActif?.startDate"
              :max="horaireActif?.endDate"
              @update:model-value="$emit('update:dateSelectionnee', $event)"
            />
          </div>
        </div>

        <div v-if="creneauActif && estPeriodeActuelle" class="mt-2">
          <v-chip color="success" variant="tonal">
            <v-icon start>mdi-clock-outline</v-icon>
            Cours en cours
          </v-chip>
        </div>

        <v-alert
          v-else-if="jourSelectionne && periodeSelectionnee && !creneauActif"
          type="info"
          variant="tonal"
          density="compact"
          border="start"
          class="mt-3"
        >
          Aucun cours défini pour ce créneau dans l'horaire actif.
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import type { Horaire } from '@/stores/ecole'

import { PERIODES_HEURES } from '@/composables/utiliserHoraires'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

const props = defineProps<{
  jourSelectionne: string
  periodeSelectionnee: number | null
  dateSelectionnee: string
  horaireActif: Horaire | null
}>()

defineEmits<{
  'update:jourSelectionne': [value: string]
  'update:periodeSelectionnee': [value: number | null]
  'update:dateSelectionnee': [value: string]
}>()

const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)

// Ne propose que les jours pour lesquels l'horaire actif a effectivement
// des cours prévus (pas la peine d'afficher un jour vide).
const joursDisponibles = computed(() => {
  if (!props.horaireActif) return JOURS
  const joursAvecCours = new Set(props.horaireActif.slots.map(s => s.day))
  return JOURS.filter(j => joursAvecCours.has(j))
})

// Liste des périodes disponibles pour le jour choisi, avec un libellé
// détaillé (heures + classe + cours) pour aider à identifier le bon créneau.
const periodesDisponibles = computed(() => {
  if (!props.horaireActif || !props.jourSelectionne) return []
  const periodesJour = props.horaireActif.slots
    .filter(s => s.day === props.jourSelectionne)
    .map(s => s.period)
  return Object.entries(PERIODES_HEURES)
    .filter(([num]) => periodesJour.includes(Number(num)))
    .map(([num, heures]) => {
      const slot = props.horaireActif!.slots.find(
        s => s.day === props.jourSelectionne && s.period === Number(num)
      )
      const infos = slot ? `  ·  ${slot.classe}  ·  ${slot.cours}` : ''
      return { title: `${heures.debut} - ${heures.fin}${infos}`, value: Number(num) }
    })
})

// Le créneau (cours/classe/local) correspondant au jour+période sélectionnés,
// ou null si aucun cours n'est prévu à ce moment-là.
const creneauActif = computed(() => {
  if (!props.horaireActif || !props.jourSelectionne || !props.periodeSelectionnee) return null
  return props.horaireActif.slots.find(
    s => s.day === props.jourSelectionne && s.period === props.periodeSelectionnee
  ) ?? null
})

// Vrai si la période sélectionnée correspond à l'heure actuelle
// (affiche le badge "Cours en cours").
const estPeriodeActuelle = computed(() => {
  if (!props.periodeSelectionnee) return false
  const d = new Date()
  const maintenant = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const h = PERIODES_HEURES[props.periodeSelectionnee]
  return maintenant >= h.debut && maintenant <= h.fin
})
</script>

<style scoped>

</style>

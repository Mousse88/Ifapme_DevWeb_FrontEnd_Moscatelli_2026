<template>
  <v-card :class="estSombre ? 'carte-sombre' : 'carte-claire'" elevation="2">
    <v-card-title class="pa-5 pb-3">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3">
        <div>
          <div class="titre-tableau mb-1">
            👥 {{ nomClasse }} — {{ nomCours }}
          </div>
          <div class="sous-titre-tableau">
            {{ jourSelectionne }} · Cours {{ periodeSelectionnee }} · {{ heuresPeriode(periodeSelectionnee) }} · {{ formaterDate(dateSelectionnee) }}
          </div>
        </div>

        <div class="d-flex align-center ga-3 flex-wrap">
          <div>
            <span class="badge badge-p">P {{ compteStatut('P') }}</span>
            <span class="badge badge-a ml-1">A {{ compteStatut('A') }}</span>
            <span class="badge badge-r ml-1">R {{ compteStatut('R') }}</span>
            <span class="badge badge-e ml-1">E {{ compteStatut('E') }}</span>
            <span class="badge badge-x ml-1">X {{ compteStatut('X') }}</span>
          </div>
          <div class="d-flex ga-2">
            <button class="bouton-tous-p" @click="$emit('toutMettre', 'P')">Tous P</button>
            <button class="bouton-tous-a" @click="$emit('toutMettre', 'A')">Tous A</button>
          </div>
        </div>
      </div>
    </v-card-title>

    <v-divider />

    <div v-if="chargement" class="pa-6 text-center">
      <v-progress-circular indeterminate color="success" />
    </div>

    <v-list v-else class="pa-0">
      <v-list-item
        v-for="(eleve, index) in eleves"
        :key="eleve.id"
        :class="['ligne-eleve', index % 2 === 0 ? 'ligne-paire' : 'ligne-impaire', estSombre ? 'sombre' : 'clair']"
      >
        <v-list-item-title class="nom-eleve">
          {{ eleve.nom }} {{ eleve.prenom }}
        </v-list-item-title>

        <template #append>
          <div class="boutons-statut">
            <button
              v-for="statut in STATUTS"
              :key="statut.code"
              :class="['btn-statut', `btn-pres-${statut.code.toLowerCase()}`, statutEleve(eleve.id) === statut.code ? 'actif' : 'inactif']"
              :title="statut.label"
              @click="$emit('changerStatut', eleve.id, statutEleve(eleve.id) === statut.code ? null : statut.code)"
            >
              {{ statut.code }}
            </button>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import type { Eleve } from '@/stores/ecole'
import { heuresPeriode } from '@/composables/utiliserHoraires'
import { formaterDate } from '@/composables/utiliserDate'

type CodeStatut = 'P' | 'A' | 'R' | 'E' | 'X'

const STATUTS: { code: CodeStatut; label: string }[] = [
  { code: 'P', label: 'Présent' },
  { code: 'A', label: 'Absent' },
  { code: 'R', label: 'Retard' },
  { code: 'E', label: 'Excusé' },
  { code: 'X', label: 'Activité' },
]

const props = defineProps<{
  eleves: Eleve[]
  statutsMap: Map<number, CodeStatut>
  nomClasse: string
  nomCours: string
  jourSelectionne: string
  periodeSelectionnee: number | null
  dateSelectionnee: string
  chargement: boolean
}>()

defineEmits<{
  changerStatut: [eleveId: number, statut: CodeStatut | null]
  toutMettre: [statut: CodeStatut]
}>()

const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)

function statutEleve(eleveId: number): CodeStatut | null {
  return props.statutsMap.get(eleveId) ?? null
}

function compteStatut(statut: CodeStatut): number {
  let n = 0
  props.statutsMap.forEach(s => { if (s === statut) n++ })
  return n
}
</script>

<style scoped>
</style>
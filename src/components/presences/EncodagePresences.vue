<template>
  <div>
    <SelectionCreneau
      v-model:jour-selectionne="jourSelectionne"
      v-model:periode-selectionnee="periodeSelectionnee"
      v-model:date-selectionnee="dateSelectionnee"
      :horaire-actif="horaireActif"
      @update:jour-selectionne="onJourChange"
    />

    <v-alert v-if="horaireActif && !selectionComplete" type="info" variant="tonal" border="start" class="mb-4">
      Sélectionne un jour, un numéro de cours et une date pour encoder les présences.
    </v-alert>

    <ListeElevesPresences
      v-if="selectionComplete"
      :eleves="elevesClasse"
      :statuts-map="statutsLocaux"
      :nom-classe="nomClasseSelectionnee"
      :nom-cours="nomCoursSelectionne"
      :jour-selectionne="jourSelectionne"
      :periode-selectionnee="periodeSelectionnee"
      :date-selectionnee="dateSelectionnee"
      :chargement="chargementPresences"
      @changer-statut="definirStatut"
      @tout-mettre="toutMettre"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEcoleStore } from '@/stores/ecole'
import { usePresencesStore } from '@/stores/presences'
import { aujourdHui } from '@/composables/utiliserDate'
import { PERIODES_HEURES } from '@/composables/utiliserHoraires'

import SelectionCreneau from '@/components/presences/SelectionCreneau.vue'
import ListeElevesPresences from '@/components/presences/ListeElevesPresences.vue'

type CodeStatut = 'P' | 'A' | 'R' | 'E' | 'X'

const JOURS_JS: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi' }
const JOURS_OFFSET: Record<string, number> = { 'Lundi': 0, 'Mardi': 1, 'Mercredi': 2, 'Jeudi': 3, 'Vendredi': 4 }

const store = useEcoleStore()
const presencesStore = usePresencesStore()

const jourSelectionne = ref<string>('')
const periodeSelectionnee = ref<number | null>(null)
const dateSelectionnee = ref<string>(aujourdHui())
const classeIdSelectionne = ref<number | null>(null)
const coursIdSelectionne = ref<number | null>(null)
const statutsLocaux = ref<Map<number, CodeStatut>>(new Map())
const chargementPresences = ref(false)

const horaireActif = computed(() => {
  const today = aujourdHui()
  return store.horaires.find(h => today >= h.startDate && today <= h.endDate) ?? null
})

const creneauActif = computed(() => {
  if (!horaireActif.value || !jourSelectionne.value || !periodeSelectionnee.value) return null
  return horaireActif.value.slots.find(
    s => s.day === jourSelectionne.value && s.period === periodeSelectionnee.value
  ) ?? null
})

const elevesClasse = computed(() => {
  if (!classeIdSelectionne.value) return []
  return store.obtenirElevesParClasse(classeIdSelectionne.value)
})

const selectionComplete = computed(() =>
  !!jourSelectionne.value &&
  periodeSelectionnee.value !== null &&
  classeIdSelectionne.value !== null &&
  coursIdSelectionne.value !== null &&
  dateSelectionnee.value !== ''
)

const nomClasseSelectionnee = computed(() =>
  store.classes.find(c => c.id === classeIdSelectionne.value)?.nom ?? ''
)

const nomCoursSelectionne = computed(() =>
  store.cours.find(c => c.id === coursIdSelectionne.value)?.nom ?? ''
)

const cleCourante = computed(() =>
  `${classeIdSelectionne.value}-${coursIdSelectionne.value}-${dateSelectionnee.value}-${periodeSelectionnee.value}`
)

onMounted(async () => {
  if (store.classes.length === 0) await store.chargerClasses()
  if (store.cours.length === 0) await store.chargerCours()
  if (store.eleves.length === 0) await store.chargerEleves()
  if (store.horaires.length === 0) await store.chargerHoraires()

  const jourdx = new Date().getDay()
  const jourNom = JOURS_JS[jourdx]
  const joursDisponibles = horaireActif.value
    ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].filter(
        j => horaireActif.value!.slots.some(s => s.day === j)
      )
    : []

  if (jourNom && joursDisponibles.includes(jourNom)) jourSelectionne.value = jourNom
  else if (joursDisponibles.length > 0) jourSelectionne.value = joursDisponibles[0]

  mettreAJourDateSelonJour(jourSelectionne.value)

  const maintenant = heureActuelle()
  const periodeAuto = Object.entries(PERIODES_HEURES).find(([, h]) => maintenant >= h.debut && maintenant <= h.fin)
  if (periodeAuto && horaireActif.value) {
    const num = Number(periodeAuto[0])
    const existe = horaireActif.value.slots.find(s => s.day === jourSelectionne.value && s.period === num)
    if (existe) periodeSelectionnee.value = num
  }

  if (creneauActif.value) {
    const classeMatch = store.classes.find(c => c.nom === creneauActif.value!.classe)
    const coursMatch = store.cours.find(c => c.nom === creneauActif.value!.cours)
    if (classeMatch) classeIdSelectionne.value = classeMatch.id
    if (coursMatch) coursIdSelectionne.value = coursMatch.id
  }
})

watch(creneauActif, (creneau) => {
  if (!creneau) return
  const classeMatch = store.classes.find(c => c.nom === creneau.classe)
  const coursMatch = store.cours.find(c => c.nom === creneau.cours)
  if (classeMatch) classeIdSelectionne.value = classeMatch.id
  if (coursMatch) coursIdSelectionne.value = coursMatch.id
})

watch(selectionComplete, async (complete) => {
  if (!complete) return
  await chargerDepuisApi()
})

watch(cleCourante, async () => {
  if (!selectionComplete.value) return
  await chargerDepuisApi()
})

async function chargerDepuisApi() {
  if (!classeIdSelectionne.value || !coursIdSelectionne.value || !periodeSelectionnee.value) return
  statutsLocaux.value = new Map()
  chargementPresences.value = true
  try {
    await presencesStore.chargerPresences(
      classeIdSelectionne.value,
      coursIdSelectionne.value,
      dateSelectionnee.value,
      periodeSelectionnee.value
    )
    const existantes = presencesStore.obtenirPresences(cleCourante.value)
    if (existantes.length > 0) {
      const map = new Map<number, CodeStatut>()
      for (const eleve of elevesClasse.value) {
        const found = existantes.find(p => p.eleveId === eleve.id)
        if (found) map.set(eleve.id, found.statut as CodeStatut)
      }
      statutsLocaux.value = map
    }
  } finally {
    chargementPresences.value = false
  }
}

async function sauvegarderMaintenant() {
  if (!selectionComplete.value) return
  if (statutsLocaux.value.size === 0) {
    try { await presencesStore.supprimerCreneau(cleCourante.value) } catch {}
    return
  }
  const presences = [...statutsLocaux.value.entries()].map(([eleveId, statut]) => ({ eleveId, statut }))
  try {
    await presencesStore.enregistrer(cleCourante.value, presences)
  } catch (e) {
    console.error('Erreur sauvegarde:', e)
  }
}

function mettreAJourDateSelonJour(jour: string) {
  if (!jour || JOURS_OFFSET[jour] === undefined) return
  const aujourd = new Date()
  const jourActuel = aujourd.getDay()
  const offsetDepuisLundi = jourActuel === 0 ? -6 : 1 - jourActuel
  const lundi = new Date(aujourd)
  lundi.setDate(aujourd.getDate() + offsetDepuisLundi)
  const cible = new Date(lundi)
  cible.setDate(lundi.getDate() + JOURS_OFFSET[jour])
  dateSelectionnee.value = `${cible.getFullYear()}-${String(cible.getMonth() + 1).padStart(2, '0')}-${String(cible.getDate()).padStart(2, '0')}`
}

async function onJourChange(jour: string) {
  jourSelectionne.value = jour
  periodeSelectionnee.value = null
  classeIdSelectionne.value = null
  coursIdSelectionne.value = null
  mettreAJourDateSelonJour(jour)
}

async function definirStatut(eleveId: number, statut: CodeStatut | null) {
  const map = new Map(statutsLocaux.value)
  if (statut === null) map.delete(eleveId)
  else map.set(eleveId, statut)
  statutsLocaux.value = map
  await sauvegarderMaintenant()
}

async function toutMettre(statut: CodeStatut) {
  const map = new Map<number, CodeStatut>()
  for (const eleve of elevesClasse.value) map.set(eleve.id, statut)
  statutsLocaux.value = map
  await sauvegarderMaintenant()
}

async function enregistrer() {
  await sauvegarderMaintenant()
}

function heureActuelle(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

defineExpose({ enregistrer })
</script>
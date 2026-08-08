<template>
  <PageLayout titre="📅 Semainier" sous-titre="Planning hebdomadaire de cours">
    <template #actions>
      <v-btn icon @click="semainePrecedente">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <span :class="['libelle-semaine', estSombre ? 'libelle-sombre' : 'libelle-clair']">
        Semaine du {{ formaterDateCourte(joursSemaine[0]) }} au {{ formaterDateCourte(joursSemaine[4]) }}
      </span>

      <v-btn icon @click="semaineSuivante">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>

    <div v-if="!horaire" class="etat-vide">
      Aucun horaire actif pour cette semaine.
    </div>

    <div v-else>
      <v-card class="pa-3 mb-4" :class="estSombre ? 'carte-info-sombre' : 'carte-info-claire'">
        <strong>Horaire utilisé :</strong>
        {{ horaire.nom }}
        <span class="text-caption">— {{ horaire.startDate }} → {{ horaire.endDate }}</span>
      </v-card>

      <TableauHoraire
        :notes="notes"
        :creneaux="horaire.slots"
        :dates-jours="datesJours"
        mode="semainier"
        @update:notes="mettreAJourNotes"
      />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useEcoleStore } from '@/stores/ecole'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { convertirDateIso } from '@/composables/utiliserDate'

import PageLayout from '@/components/Pagelayout.vue'
import TableauHoraire from '@/components/horaires/TableauHoraire.vue'

const store = useEcoleStore()
const route = useRoute()
const theme = useTheme()

const estSombre = computed(() => theme.global.current.value.dark)

const dateActuelle = ref(new Date())
const notes = ref<Record<string, string>>({})
const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

onMounted(async () => {
  if (route.query.date) {
    const d = new Date(route.query.date as string)
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
    dateActuelle.value = d
  }
  if (store.horaires.length === 0) await store.chargerHoraires()
  if (store.notesSemainier.length === 0) await store.chargerNotesSemainier()
  chargerNotesAffichees()
})

function obtenirLundi(date: Date) {
  const d = new Date(date)
  const jour = d.getDay()
  d.setDate(d.getDate() + (jour === 0 ? -6 : 1) - jour)
  return d
}

const joursSemaine = computed(() => {
  const lundi = obtenirLundi(dateActuelle.value)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lundi)
    d.setDate(lundi.getDate() + i)
    return d
  })
})

const datesJours = computed(() =>
  jours.reduce<Record<string, string>>((res, jour, i) => {
    res[jour] = convertirDateIso(joursSemaine.value[i])
    return res
  }, {})
)

const horaire = computed(() => {
  const debut = convertirDateIso(joursSemaine.value[0])
  const fin = convertirDateIso(joursSemaine.value[4])
  return store.horaires.find(h => h.startDate <= fin && h.endDate >= debut) ?? null
})

watch(
  () => [horaire.value?.id, convertirDateIso(joursSemaine.value[0])],
  () => chargerNotesAffichees()
)

function chargerNotesAffichees() {
  if (!horaire.value) { notes.value = {}; return }
  const nouvellesNotes: Record<string, string> = {}
  jours.forEach((jour, i) => {
    const date = convertirDateIso(joursSemaine.value[i])
    for (let p = 1; p <= 8; p++) {
      const note = store.obtenirNoteSemainier(horaire.value!.id, date, jour, p)
      if (note) nouvellesNotes[`${jour}-${p}`] = note.contenu
    }
  })
  notes.value = nouvellesNotes
}

async function mettreAJourNotes(nouvellesNotes: Record<string, string>) {
  if (!horaire.value) return
  const anciennes = notes.value
  notes.value = nouvellesNotes
  for (const cle in nouvellesNotes) {
    if (nouvellesNotes[cle] === anciennes[cle]) continue
    const [jour, periodeTexte] = cle.split('-')
    const periode = Number(periodeTexte)
    const indexJour = jours.indexOf(jour)
    if (indexJour === -1) continue
    await store.modifierNoteSemainier({
      horaireId: horaire.value.id,
      date: convertirDateIso(joursSemaine.value[indexJour]),
      day: jour,
      period: periode,
      contenu: nouvellesNotes[cle],
    })
  }
}

function semainePrecedente() {
  const d = new Date(dateActuelle.value)
  d.setDate(d.getDate() - 7)
  dateActuelle.value = d
}

function semaineSuivante() {
  const d = new Date(dateActuelle.value)
  d.setDate(d.getDate() + 7)
  dateActuelle.value = d
}

function formaterDateCourte(date: Date) {
  return date.toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.libelle-semaine { font-weight: bold; }
.libelle-clair { color: #065f46; }
.libelle-sombre { color: white; }

.etat-vide { color: #6b7280; font-style: italic; }
.carte-info-claire { color: #111827; }
.carte-info-sombre { color: #f1f5f9; }
</style>
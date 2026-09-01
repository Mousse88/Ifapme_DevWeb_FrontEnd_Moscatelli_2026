<!--
  Page Semainier : affiche l'horaire de la semaine sélectionnée (navigation
  semaine précédente/suivante), avec un champ de note libre par créneau
  pour noter ce qui a été fait ce jour-là. Peut être ouverte directement
  sur une semaine précise via un paramètre d'URL "date" (utilisé par le
  lien "aller à cette semaine" du calendrier annuel).
-->
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

// Date "de référence" servant à calculer la semaine affichée (n'importe
// quel jour de cette semaine-là, peu importe lequel).
const dateActuelle = ref(new Date())
// Notes du semainier affichées, indexées par "jour-periode" (ex: "Lundi-3").
const notes = ref<Record<string, string>>({})
const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

// Au montage : si un paramètre "date" est présent dans l'URL (venant du
// calendrier annuel), on l'utilise comme semaine de départ. On corrige le
// décalage de fuseau horaire pour que "new Date('2026-05-04')" représente
// bien le 4 mai en heure locale et pas la veille.
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

// Renvoie le lundi de la semaine contenant la date donnée.
function obtenirLundi(date: Date) {
  const d = new Date(date)
  const jour = d.getDay()
  d.setDate(d.getDate() + (jour === 0 ? -6 : 1) - jour)
  return d
}

// Les 5 jours (Lundi à Vendredi) de la semaine actuellement affichée.
const joursSemaine = computed(() => {
  const lundi = obtenirLundi(dateActuelle.value)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lundi)
    d.setDate(lundi.getDate() + i)
    return d
  })
})

// Map "nom du jour" -> date ISO correspondante pour la semaine affichée
// (utilisée pour afficher les dates sous les noms de jours dans le tableau).
const datesJours = computed(() =>
  jours.reduce<Record<string, string>>((res, jour, i) => {
    res[jour] = convertirDateIso(joursSemaine.value[i])
    return res
  }, {})
)

// L'horaire dont la période de validité couvre au moins un jour de la
// semaine affichée.
const horaire = computed(() => {
  const debut = convertirDateIso(joursSemaine.value[0])
  const fin = convertirDateIso(joursSemaine.value[4])
  return store.horaires.find(h => h.startDate <= fin && h.endDate >= debut) ?? null
})

// Recharge les notes affichées si on change de semaine ou d'horaire.
watch(
  () => [horaire.value?.id, convertirDateIso(joursSemaine.value[0])],
  () => chargerNotesAffichees()
)

// Va chercher, pour chaque créneau (jour x période) de la semaine, la note
// déjà enregistrée dans le store et la place dans l'objet "notes" utilisé
// par le tableau (clé "jour-periode").
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

// Reçoit le nouvel état complet des notes depuis TableauHoraire (v-model),
// et ne sauvegarde vers l'API que les notes qui ont réellement changé
// (comparaison avec l'ancien état) pour éviter des appels inutiles.
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

// Formate une date en "JJ/MM" pour l'affichage du libellé "Semaine du ... au ...".
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

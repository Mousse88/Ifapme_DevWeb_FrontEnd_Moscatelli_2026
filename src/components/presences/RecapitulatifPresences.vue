<!--
  Page/section récapitulative des présences : choix classe + cours + période,
  puis tableau récapitulatif du nombre de P/A/R/E/X par élève sur la
  période choisie (ou sur toute l'année si "Annuel" est sélectionné).
-->
<template>
  <div>
    <v-card class="mb-5" :class="estSombre ? 'carte-sombre' : 'carte-claire'" elevation="2">
      <v-card-text class="pa-5">
        <div class="grille-selection">
          <div>
            <label class="libelle-champ">Classe</label>
            <v-select
              v-model="classeIdSelectionne"
              :items="classes"
              item-title="nom"
              item-value="id"
              placeholder="Choisir une classe..."
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="coursIdSelectionne = null"
            />
          </div>

          <div>
            <label class="libelle-champ">Cours</label>
            <v-select
              v-model="coursIdSelectionne"
              :items="coursDisponibles"
              item-title="nom"
              item-value="id"
              placeholder="Choisir un cours..."
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="!classeIdSelectionne"
            />
          </div>

          <div>
            <label class="libelle-champ">Période</label>
            <v-select
              v-model="periodeSelectionnee"
              :items="optionsPeriodes"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-alert v-if="!selectionComplete" type="info" variant="tonal" border="start">
      Sélectionnez une classe et un cours pour afficher le récapitulatif.
    </v-alert>

    <div v-else-if="chargement" class="pa-6 text-center">
      <v-progress-circular indeterminate color="success" />
    </div>

    <v-alert v-else-if="presencesFiltrees.length === 0" type="warning" variant="tonal" border="start">
      Aucune présence encodée pour cette sélection.
    </v-alert>

    <v-card v-else :class="estSombre ? 'carte-sombre' : 'carte-claire'" elevation="2">
      <v-card-title class="pa-5 pb-2">
        <div class="d-flex justify-space-between align-center flex-wrap ga-3">
          <span class="titre-recapitulatif">
            📊 {{ nomClasseSelectionnee }} — {{ nomCoursSelectionne }}
            — {{ periodeSelectionnee === 'annuel' ? 'Annuel' : 'Période ' + periodeSelectionnee }}
          </span>
          <v-chip color="success" variant="tonal">
            <v-icon start>mdi-school</v-icon>
            {{ totalCours }} cours encodé{{ totalCours > 1 ? 's' : '' }}
          </v-chip>
        </div>
      </v-card-title>

      <div class="tableau-scroll">
        <table class="tableau-presences">
          <thead>
            <tr>
              <th class="col-eleve">Élève</th>
              <th class="col-total col-p">P</th>
              <th class="col-total col-a">A</th>
              <th class="col-total col-r">R</th>
              <th class="col-total col-e">E</th>
              <th class="col-total col-x">X</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="eleve in elevesClasse" :key="eleve.id" class="ligne-corps">
              <td class="col-eleve nom-eleve">{{ eleve.nom }} {{ eleve.prenom }}</td>
              <td class="col-total">{{ compterPourEleve(eleve.id, 'P') }}</td>
              <td class="col-total">{{ compterPourEleve(eleve.id, 'A') }}</td>
              <td class="col-total">{{ compterPourEleve(eleve.id, 'R') }}</td>
              <td class="col-total">{{ compterPourEleve(eleve.id, 'E') }}</td>
              <td class="col-total">{{ compterPourEleve(eleve.id, 'X') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legende pa-4">
        <span class="item-legende legende-p">P Présent</span>
        <span class="item-legende legende-a">A Absent</span>
        <span class="item-legende legende-r">R Retard</span>
        <span class="item-legende legende-e">E Excusé</span>
        <span class="item-legende legende-x">X Activité</span>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useEcoleStore } from '@/stores/ecole'
import { useParametresStore } from '@/stores/parametres'
import { apiGet } from '@/services/api'

type CodeStatut = 'P' | 'A' | 'R' | 'E' | 'X'
type Periode = number | 'annuel'

interface PresenceBackend {
  id: number
  eleveId: number
  classeId: number
  coursId: number
  date: string
  periode: number
  periodeCotation: number
  statut: string
}

const store = useEcoleStore()
const parametres = useParametresStore()
const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)

const classeIdSelectionne = ref<number | null>(null)
const coursIdSelectionne = ref<number | null>(null)
const periodeSelectionnee = ref<Periode>(parametres.periodeActive)
const chargement = ref(false)
// Toutes les présences (non filtrées) récupérées de l'API pour la classe/cours choisis.
const presencesApi = ref<PresenceBackend[]>([])

const optionsPeriodes = computed(() => [
  { title: `Période 1${parametres.periodeActive === 1 ? ' (active)' : ''}`, value: 1 },
  { title: `Période 2${parametres.periodeActive === 2 ? ' (active)' : ''}`, value: 2 },
  { title: `Période 3${parametres.periodeActive === 3 ? ' (active)' : ''}`, value: 3 },
  { title: 'Annuel', value: 'annuel' },
])

const classes = computed(() => store.obtenirClassesTries())

// Ne propose que les cours réellement associés à la classe sélectionnée.
const coursDisponibles = computed(() => {
  if (!classeIdSelectionne.value) return []
  const classe = store.classes.find(c => c.id === classeIdSelectionne.value)
  if (!classe) return []
  return store.cours.filter(c => classe.coursIds.includes(c.id))
})

const selectionComplete = computed(() =>
  classeIdSelectionne.value !== null && coursIdSelectionne.value !== null
)

const nomClasseSelectionnee = computed(() =>
  store.classes.find(c => c.id === classeIdSelectionne.value)?.nom ?? ''
)

const nomCoursSelectionne = computed(() =>
  store.cours.find(c => c.id === coursIdSelectionne.value)?.nom ?? ''
)

const elevesClasse = computed(() => {
  if (!classeIdSelectionne.value) return []
  return store.obtenirElevesParClasse(classeIdSelectionne.value)
})

// Filtre les présences chargées selon la période choisie
// ("annuel" = toutes les périodes confondues).
const presencesFiltrees = computed(() => {
  if (periodeSelectionnee.value === 'annuel') return presencesApi.value
  return presencesApi.value.filter(p => Number(p.periodeCotation) === Number(periodeSelectionnee.value))
})

// Nombre de jours de cours distincts encodés (on exclut le statut "X" =
// activité, qui ne compte pas comme un cours normal donné).
const totalCours = computed(() => {
  const creneauxAvecCours = new Set(
    presencesFiltrees.value
      .filter(p => p.statut !== 'X')
      .map(p => `${p.date}-${p.periode}`)
  )
  return creneauxAvecCours.size
})

// Charge toutes les présences enregistrées pour la classe/cours choisis
// (toutes périodes confondues : le filtrage par période se fait ensuite
// côté front dans presencesFiltrees, pour éviter de re-fetcher à chaque
// changement de période).
async function chargerPresences() {
  if (!selectionComplete.value) return
  chargement.value = true
  try {
    presencesApi.value = await apiGet<PresenceBackend[]>(
      `/presences?classeId=${classeIdSelectionne.value}&coursId=${coursIdSelectionne.value}`
    )
  } catch (e) {
    console.error('Erreur chargement récapitulatif:', e)
  } finally {
    chargement.value = false
  }
}

// Recharge automatiquement dès que la classe ou le cours sélectionné change.
watch([classeIdSelectionne, coursIdSelectionne], async () => {
  await chargerPresences()
})

// Exposé au parent pour permettre un rechargement manuel (ex: après avoir
// encodé de nouvelles présences ailleurs dans l'app).
async function recharger() {
  await chargerPresences()
}

// Compte le nombre de fois qu'un élève a eu un statut donné dans la sélection filtrée.
function compterPourEleve(eleveId: number, statut: CodeStatut): number {
  return presencesFiltrees.value.filter(p => p.eleveId === eleveId && p.statut === statut).length
}

defineExpose({ recharger })
</script>

<style scoped>
.carte-claire { background: white; border: 1px solid #d1fae5; }
.carte-sombre { background: #1e293b; border: 1px solid #334155; }

.grille-selection { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
@media (max-width: 768px) { .grille-selection { grid-template-columns: 1fr; } }

.libelle-champ { display: block; font-size: 13px; font-weight: 600; color: #065f46; margin-bottom: 6px; }
.carte-sombre .libelle-champ { color: #6ee7b7; }

.titre-recapitulatif { font-size: 16px; font-weight: 700; color: #065f46; }
.carte-sombre .titre-recapitulatif { color: #6ee7b7; }

.tableau-scroll { overflow-x: auto; padding: 0 20px 20px; }
.tableau-presences { width: 100%; border-collapse: collapse; }

.tableau-presences th {
  background: #10b981; color: white;
  padding: 10px 8px; text-align: center;
  font-weight: 700; font-size: 13px;
}

.col-eleve { text-align: left !important; min-width: 200px; padding-left: 16px !important; }
.col-total { min-width: 60px; font-weight: 700; text-align: center; }
.col-p { background: #059669 !important; }
.col-a { background: #dc2626 !important; }
.col-r { background: #ea580c !important; }
.col-e { background: #2563eb !important; }
.col-x { background: #9333ea !important; }

.ligne-corps td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px; }
.nom-eleve { text-align: left !important; font-weight: 600; padding-left: 16px !important; }

.legende { display: flex; gap: 12px; flex-wrap: wrap; border-top: 1px solid #e5e7eb; }
.item-legende { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
.legende-p { background: #d1fae5; color: #065f46; }
.legende-a { background: #fee2e2; color: #991b1b; }
.legende-r { background: #ffedd5; color: #9a3412; }
.legende-e { background: #dbeafe; color: #1e40af; }
.legende-x { background: #f3e8ff; color: #6b21a8; }
</style>

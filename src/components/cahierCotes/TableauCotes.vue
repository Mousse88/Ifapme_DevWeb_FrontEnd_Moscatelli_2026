<!--
  Tableau de cotes pour un cours/classe/période donnés : une ligne par élève,
  une colonne par interro, avec le total et la moyenne sur 20 calculés
  automatiquement. Permet d'ajouter une nouvelle interro et de saisir les
  points de chaque élève directement dans le tableau (avec navigation au
  clavier via Tab).
-->
<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">
        {{ nomCours }} — Période {{ periode }}
      </h2>

      <div class="d-flex align-center ga-3">
        <!-- Le bouton "+ Interro" n'est visible que si la période affichée
             est bien la période active (on ne peut pas ajouter d'interro
             dans une période déjà clôturée). -->
        <BoutonApp
          v-if="estPeriodeActive"
          variante="success"
          @click="dialogue = true"
        >
          + Interro
        </BoutonApp>

        <v-chip v-else color="warning" variant="tonal" size="small">
          <v-icon start size="14">mdi-lock</v-icon>
          Période {{ periode }} — lecture seule
        </v-chip>
      </div>
    </div>

    <div v-if="elevesClasse.length === 0" class="text-medium-emphasis">
      Aucun élève dans cette classe.
    </div>

    <v-table v-else class="elevation-1 rounded-lg">
      <thead>
        <tr>
          <th>Élève</th>
          <!-- Une colonne par interro, avec un bouton de suppression
               (visible uniquement si la période est active) -->
          <th
            v-for="interro in interrosCours"
            :key="interro.id"
            class="text-center"
          >
            <div class="d-flex flex-column align-center">
              <span class="font-weight-bold">{{ interro.titre }}</span>
              <span class="text-caption">/ {{ interro.nombrePoints }}</span>
              <v-btn
                v-if="estPeriodeActive"
                icon
                variant="text"
                size="x-small"
                class="bouton-supprimer"
                @click="store.supprimerInterro(interro.id)"
              >
                🗑️
              </v-btn>
            </div>
          </th>
          <th class="text-center">Total</th>
          <th class="text-center">/20</th>
        </tr>
      </thead>

      <tbody>
        <!-- Une ligne par élève, une cellule éditable par interro -->
        <tr v-for="(eleve, indexEleve) in elevesClasse" :key="eleve.id">
          <td class="font-weight-medium">{{ eleve.nom }} {{ eleve.prenom }}</td>
          <td
            v-for="(interro, indexInterro) in interrosCours"
            :key="`${eleve.id}-${interro.id}`"
            class="text-center"
          >
            <!-- Champ de saisie de la note. En lecture seule si la période
                 n'est plus active. La navigation Tab passe à l'élève suivant
                 dans la même colonne plutôt que de suivre l'ordre naturel du DOM. -->
            <v-text-field
              :ref="(element) => enregistrerChamp(element, indexEleve, indexInterro)"
              :model-value="obtenirPoints(interro.id, eleve.id)"
              :readonly="!estPeriodeActive"
              @update:model-value="(valeur) => modifierPoints(interro.id, eleve.id, valeur)"
              @keydown.tab.prevent="gererTab(indexEleve, indexInterro, $event)"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              min="0"
              :max="interro.nombrePoints"
              style="max-width: 90px; margin: auto"
            />
          </td>
          <!-- Total "points obtenus / points max" et moyenne sur 20,
               recalculés en direct via le composable utiliserCotes -->
          <td class="text-center font-weight-bold">
            {{ calculerTotalPoints(proprietes.classeId, proprietes.coursId, proprietes.periode, eleve.id) }}
          </td>
          <td class="text-center font-weight-bold">
            {{ calculerMoyenneSur20(proprietes.classeId, proprietes.coursId, proprietes.periode, eleve.id) }}
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Popup de création d'une nouvelle interro -->
    <v-dialog v-model="dialogue" max-width="420">
      <v-card class="carte-dialogue">
        <v-card-title>Ajouter une interro</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="nouvelleInterro.titre"
            label="Titre de l'interro"
            placeholder="Ex: Interro 1, API, HTML..."
          />
          <v-text-field
            v-model.number="nouvelleInterro.nombrePoints"
            label="Nombre de points"
            type="number"
            min="1"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <BoutonApp variante="secondary" @click="dialogue = false">Annuler</BoutonApp>
          <BoutonApp
            variante="success"
            :disabled="!nouvelleInterro.titre || !nouvelleInterro.nombrePoints"
            @click="enregistrerInterro"
          >
            Ajouter
          </BoutonApp>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useEcoleStore } from '@/stores/ecole'
import { useParametresStore } from '@/stores/parametres'
import { utiliserCotes } from '@/composables/utiliserCotes'
import BoutonApp from '@/components/BoutonApp.vue'

const proprietes = defineProps<{
  classeId: number
  coursId: number
  periode: number
}>()

const store = useEcoleStore()
const parametres = useParametresStore()
const { calculerTotalPoints, calculerMoyenneSur20 } = utiliserCotes()

// On ne peut modifier les notes que si la période affichée est bien
// la période de cotation active de l'école (sinon lecture seule).
const estPeriodeActive = computed(() => proprietes.periode === parametres.periodeActive)

// Popup création interro
const dialogue = ref(false)
const nouvelleInterro = ref({ titre: '', nombrePoints: 20 })
// Garde une référence vers chaque champ de saisie (indexée par élève/interro)
// pour pouvoir y déplacer le focus manuellement (navigation Tab personnalisée).
const champsPoints = ref<Record<string, any>>({})

const elevesClasse = computed(() => store.obtenirElevesParClasse(proprietes.classeId))
const interrosCours = computed(() => store.obtenirInterros(proprietes.classeId, proprietes.coursId, proprietes.periode))
const nomCours = computed(() => store.cours.find(c => c.id === proprietes.coursId)?.nom ?? 'Cours')

// Crée l'interro via le store, réinitialise le formulaire et ferme la popup.
function enregistrerInterro() {
  store.ajouterInterro(
    proprietes.classeId,
    proprietes.coursId,
    proprietes.periode,
    nouvelleInterro.value.titre,
    Number(nouvelleInterro.value.nombrePoints),
  )
  nouvelleInterro.value = { titre: '', nombrePoints: 20 }
  dialogue.value = false
}

// Renvoie les points obtenus par un élève à une interro, ou null si pas encore encodé.
function obtenirPoints(interroId: number, eleveId: number) {
  return store.obtenirNote(interroId, eleveId)?.pointsObtenus ?? null
}

// Met à jour la note dans le store (ignore si la période n'est plus active).
// Une valeur vide est convertie en null (note pas encore encodée).
function modifierPoints(interroId: number, eleveId: number, valeur: string | number | null) {
  if (!estPeriodeActive.value) return
  const v = valeur === '' || valeur === null ? null : Number(valeur)
  store.modifierNote(interroId, eleveId, v)
}

// Construit une clé unique pour identifier un champ dans champsPoints.
function cleChamp(indexEleve: number, indexInterro: number) {
  return `${indexEleve}-${indexInterro}`
}

// Callback de la prop "ref" dynamique de v-text-field : enregistre l'élément
// DOM du champ dans champsPoints pour pouvoir le retrouver plus tard.
function enregistrerChamp(element: any, indexEleve: number, indexInterro: number) {
  if (!element) return
  champsPoints.value[cleChamp(indexEleve, indexInterro)] = element
}

// Navigation personnalisée avec Tab / Shift+Tab : au lieu de suivre l'ordre
// du DOM (qui irait à la colonne suivante), on descend/remonte dans la même
// colonne (même interro), d'élève en élève, pour saisir les notes plus vite.
function gererTab(indexEleve: number, indexInterro: number, evenement: KeyboardEvent) {
  const suivant = evenement.shiftKey ? indexEleve - 1 : indexEleve + 1
  if (suivant < 0 || suivant >= elevesClasse.value.length) return
  nextTick(() => {
    const champ = champsPoints.value[cleChamp(suivant, indexInterro)]
    const input = champ?.$el?.querySelector?.('input')
    input?.focus()
    input?.select()
  })
}
</script>

<style scoped>
.bouton-supprimer { color: #ef4444; }
.carte-dialogue { border-radius: 16px; }
</style>

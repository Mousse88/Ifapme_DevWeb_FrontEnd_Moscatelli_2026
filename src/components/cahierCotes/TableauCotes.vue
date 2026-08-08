<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">
        {{ nomCours }} — Période {{ periode }}
      </h2>

      <div class="d-flex align-center ga-3">
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
        <tr v-for="(eleve, indexEleve) in elevesClasse" :key="eleve.id">
          <td class="font-weight-medium">{{ eleve.nom }} {{ eleve.prenom }}</td>
          <td
            v-for="(interro, indexInterro) in interrosCours"
            :key="`${eleve.id}-${interro.id}`"
            class="text-center"
          >
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
          <td class="text-center font-weight-bold">
            {{ calculerTotalPoints(proprietes.classeId, proprietes.coursId, proprietes.periode, eleve.id) }}
          </td>
          <td class="text-center font-weight-bold">
            {{ calculerMoyenneSur20(proprietes.classeId, proprietes.coursId, proprietes.periode, eleve.id) }}
          </td>
        </tr>
      </tbody>
    </v-table>

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

const estPeriodeActive = computed(() => proprietes.periode === parametres.periodeActive)

const dialogue = ref(false)
const nouvelleInterro = ref({ titre: '', nombrePoints: 20 })
const champsPoints = ref<Record<string, any>>({})

const elevesClasse = computed(() => store.obtenirElevesParClasse(proprietes.classeId))
const interrosCours = computed(() => store.obtenirInterros(proprietes.classeId, proprietes.coursId, proprietes.periode))
const nomCours = computed(() => store.cours.find(c => c.id === proprietes.coursId)?.nom ?? 'Cours')

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

function obtenirPoints(interroId: number, eleveId: number) {
  return store.obtenirNote(interroId, eleveId)?.pointsObtenus ?? null
}

function modifierPoints(interroId: number, eleveId: number, valeur: string | number | null) {
  if (!estPeriodeActive.value) return
  const v = valeur === '' || valeur === null ? null : Number(valeur)
  store.modifierNote(interroId, eleveId, v)
}

function cleChamp(indexEleve: number, indexInterro: number) {
  return `${indexEleve}-${indexInterro}`
}

function enregistrerChamp(element: any, indexEleve: number, indexInterro: number) {
  if (!element) return
  champsPoints.value[cleChamp(indexEleve, indexInterro)] = element
}

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
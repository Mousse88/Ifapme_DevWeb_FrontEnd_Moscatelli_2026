<template>
  <div>
    <div v-if="coursSelectionneId || periode === 'annuel'" class="mb-4">
      <BoutonApp variante="secondary" @click="retourAuxCours">← Retour aux cours</BoutonApp>
    </div>

    <div v-if="!coursSelectionneId && periode !== 'annuel'" class="mb-6">
      <h2 class="text-h5 font-weight-bold mb-4">Choisis un cours</h2>

      <div v-if="cours.length === 0" class="text-medium-emphasis">
        Aucun cours associé à cette classe.
      </div>

      <div v-else class="grille">
        <v-card
          v-for="coursItem in cours"
          :key="coursItem.id"
          class="pa-4 rounded-xl elevation-2 carte-tuile curseur"
          @click="coursSelectionneId = coursItem.id"
        >
          <div class="text-h6 font-weight-bold">{{ coursItem.nom }}</div>
        </v-card>
      </div>
    </div>

    <div v-if="periode === 'annuel'">
      <h2 class="text-h5 font-weight-bold mb-6">Aperçu annuel</h2>

      <div v-if="cours.length === 0" class="text-medium-emphasis">
        Aucun cours associé à cette classe.
      </div>

      <div v-else class="d-flex flex-column ga-4">
        <v-card v-for="coursItem in cours" :key="coursItem.id" class="rounded-xl elevation-2">
          <div class="entete-cours pa-4" @click="toggleCours(coursItem.id)">
            <span class="text-h6 font-weight-bold">{{ coursItem.nom }}</span>
            <v-icon class="chevron" :class="{ 'chevron-ouvert': estOuvert(coursItem.id) }">
              mdi-chevron-down
            </v-icon>
          </div>

          <v-expand-transition>
            <div v-if="estOuvert(coursItem.id)">
              <v-divider />
              <div v-if="elevesClasse.length === 0" class="pa-4 text-medium-emphasis">
                Aucun élève dans cette classe.
              </div>
              <v-table v-else class="rounded-b-xl">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th class="text-center">Période 1</th>
                    <th class="text-center">Période 2</th>
                    <th class="text-center">Période 3</th>
                    <th class="text-center">Annuel /20</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="eleve in elevesClasse" :key="`${coursItem.id}-${eleve.id}`">
                    <td class="font-weight-medium">{{ eleve.nom }} {{ eleve.prenom }}</td>
                    <td class="text-center">{{ calculerMoyenneParPeriode(proprietes.classeId, coursItem.id, 1, eleve.id) }}</td>
                    <td class="text-center">{{ calculerMoyenneParPeriode(proprietes.classeId, coursItem.id, 2, eleve.id) }}</td>
                    <td class="text-center">{{ calculerMoyenneParPeriode(proprietes.classeId, coursItem.id, 3, eleve.id) }}</td>
                    <td class="text-center font-weight-bold">{{ calculerMoyenneAnnuelle(proprietes.classeId, coursItem.id, eleve.id) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-expand-transition>
        </v-card>
      </div>
    </div>

    <TableauCotes
      v-if="coursSelectionneId && periode !== 'annuel'"
      :classe-id="classeId"
      :cours-id="coursSelectionneId"
      :periode="periode as number"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEcoleStore, type Cours } from '@/stores/ecole'
import { utiliserCotes } from '@/composables/utiliserCotes'
import BoutonApp from '@/components/BoutonApp.vue'
import TableauCotes from '@/components/cahierCotes/TableauCotes.vue'

type PeriodeValeur = number | 'annuel'

const proprietes = defineProps<{
  classeId: number
  periode: PeriodeValeur
  cours: Cours[]
}>()

const emit = defineEmits<{ (e: 'retour-periode'): void }>()

const store = useEcoleStore()
const { calculerMoyenneParPeriode, calculerMoyenneAnnuelle } = utiliserCotes()

const coursSelectionneId = ref<number | null>(null)
const elevesClasse = computed(() => store.obtenirElevesParClasse(proprietes.classeId))

const coursOuverts = ref<Set<number>>(new Set())

function estOuvert(coursId: number): boolean {
  return coursOuverts.value.has(coursId)
}

function toggleCours(coursId: number) {
  const s = new Set(coursOuverts.value)
  if (s.has(coursId)) s.delete(coursId)
  else s.add(coursId)
  coursOuverts.value = s
}

watch(() => proprietes.classeId, () => {
  coursSelectionneId.value = null
  coursOuverts.value = new Set()
})

watch(() => proprietes.periode, (p) => {
  if (p === 'annuel') {
    coursSelectionneId.value = null
    coursOuverts.value = new Set()
  }
})

function retourAuxCours() {
  coursSelectionneId.value = null
  if (proprietes.periode === 'annuel') emit('retour-periode')
}
</script>

<style scoped>
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.carte-tuile { transition: all 0.2s ease; }
.carte-tuile:hover { transform: translateY(-2px); }
.curseur { cursor: pointer; }

.entete-cours {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border-radius: inherit;
  transition: background 0.15s;
}
.entete-cours:hover { background: rgba(0, 0, 0, 0.04); }

.chevron { transition: transform 0.25s ease; }
.chevron-ouvert { transform: rotate(180deg); }
</style>
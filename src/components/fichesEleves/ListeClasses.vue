<template>
  <section>
    <h2 class="titre-section">🏫 Mes classes</h2>

    <div v-if="classes.length === 0" class="etat-vide">
      Aucune classe créée...
    </div>

    <div v-else ref="grilleRef" class="grille">
      <v-card
        v-for="classe in classes"
        :key="classe.id"
        class="carte carte-classe"
        :style="store.classeOuverte(classe.id) ? { height: 'auto' } : { height: hauteurFermee + 'px' }"
      >
        <!-- En-tête mesurable : c'est uniquement cette partie qui définit la hauteur fermée -->
        <div class="entete-carte" :ref="el => enregistrerEntete(el, classe.id)">
          <div class="infos-carte">
            <div class="titre-carte">{{ classe.nom }}</div>
            <div class="sous-texte-carte">{{ obtenirNomCours(classe.coursIds) }}</div>
            <v-chip size="small" class="mt-2 pastille orange">
              {{ elevesParClasse(classe.id).length }} élève(s)
            </v-chip>
          </div>

          <div class="boutons-carte">
            <v-btn icon variant="text" size="small" class="bouton-ajouter" @click.stop="$emit('ajouter-eleve', classe.id)">+</v-btn>
            <v-btn icon variant="text" size="small" class="bouton-modifier" @click.stop="$emit('modifier-classe', classe)">✏️</v-btn>
            <v-btn icon variant="text" size="small" class="bouton-supprimer" @click.stop="$emit('supprimer-classe', classe.id)">🗑️</v-btn>
            <v-btn icon variant="text" size="small" class="bouton-toggle" @click.stop="store.toggleClasse(classe.id)">
              <v-icon>{{ store.classeOuverte(classe.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </div>
        </div>

        <v-expand-transition>
          <div v-if="store.classeOuverte(classe.id)" class="mt-4">
            <div v-if="!elevesParClasse(classe.id).length" class="etat-vide">
              Aucun élève dans cette classe...
            </div>
            <v-card
              v-for="eleve in elevesParClasse(classe.id)"
              :key="eleve.id"
              class="carte-eleve"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold nom-eleve">{{ eleve.nom }} {{ eleve.prenom }}</div>
                  <div class="text-caption">🎂 {{ eleve.dateNaissance }}</div>
                </div>
                <div class="d-flex ga-2">
                  <v-btn icon variant="text" size="small" class="bouton-modifier" @click.stop="$emit('modifier-eleve', eleve)">✏️</v-btn>
                  <v-btn icon variant="text" size="small" class="bouton-supprimer" @click.stop="$emit('supprimer-eleve', eleve.id)">🗑️</v-btn>
                </div>
              </div>
            </v-card>
          </div>
        </v-expand-transition>
      </v-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useEcoleStore, type Classe, type Eleve } from '@/stores/ecole'

const store = useEcoleStore()

const props = defineProps<{
  classes: Classe[]
  elevesParClasse: (classeId: number) => Eleve[]
  obtenirNomCours: (ids: number[]) => string
}>()

defineEmits<{
  (e: 'ajouter-eleve', classeId: number): void
  (e: 'modifier-classe', classe: Classe): void
  (e: 'supprimer-classe', classeId: number): void
  (e: 'modifier-eleve', eleve: Eleve): void
  (e: 'supprimer-eleve', eleveId: number): void
}>()

const grilleRef = ref<HTMLElement | null>(null)
const hauteurFermee = ref(0)

// Map classeId → élément DOM de l'en-tête
const entetes = new Map<number, HTMLElement>()

function enregistrerEntete(el: unknown, classeId: number) {
  if (el instanceof HTMLElement) entetes.set(classeId, el)
  else entetes.delete(classeId)
}

// On mesure uniquement la hauteur de l'en-tête (padding carte inclus = +36px pour padding top+bottom)
const PADDING_CARTE = 36

async function recalculerHauteur() {
  await nextTick()
  let max = 0
  for (const [, el] of entetes) {
    max = Math.max(max, el.offsetHeight + PADDING_CARTE)
  }
  if (max > 0) hauteurFermee.value = max
}

watch(() => props.classes, () => recalculerHauteur())

let ro: ResizeObserver | null = null
onMounted(() => {
  recalculerHauteur()
  ro = new ResizeObserver(() => recalculerHauteur())
  if (grilleRef.value) ro.observe(grilleRef.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<style scoped>
.carte { padding: 18px; border-radius: 16px; overflow: hidden; }

.entete-carte {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.infos-carte {
  flex: 1;
  min-width: 0;
}

.boutons-carte {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.sous-texte-carte {
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
}

.titre-carte, .sous-texte-carte, .nom-eleve { color: #111827; }
.carte-classe { background: linear-gradient(135deg, #ecfdf5, #bbf7d0); }

.carte-eleve {
  padding: 10px;
  border-radius: 10px;
  background: white;
  margin-bottom: 8px;
  color: #111827;
}

.pastille { background: #065f46; color: white; }
.pastille.orange { background: #f97316; }
.bouton-toggle { color: #6b7280; }

.grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  align-items: start;
}
</style>
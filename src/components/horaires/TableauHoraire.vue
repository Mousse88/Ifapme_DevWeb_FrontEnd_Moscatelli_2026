<!--
  Composant "grille horaire" réutilisé dans 2 contextes différents (prop "mode") :
  - mode "edition" : utilisé sur la page Horaires pour construire/modifier
    la grille (clic sur une cellule = ouvrir le formulaire d'affectation)
  - mode "semainier" : utilisé sur la page Semainier en lecture, avec en plus
    un champ de note libre par créneau (ce que le prof a fait ce jour-là)
-->
<template>
  <div class="conteneur-tableau" :class="estSombre ? 'sombre' : 'clair'">
    <table class="tableau">
      <thead>
        <tr>
          <th class="entete-periode">P</th>
          <th v-for="jour in jours" :key="jour">
            {{ jour }}
            <template v-if="datesJours">
              <br />
              <small>{{ datesJours[jour] }}</small>
            </template>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="periode in periodes" :key="periode">
          <td class="periode">{{ periode }}</td>

          <td
            v-for="jour in jours"
            :key="jour + periode"
            class="cellule"
            :class="{ modifiable: mode === 'edition' }"
            @click="gererClicCellule(jour, periode)"
          >
            <div v-if="obtenirCreneau(jour, periode)" class="contenu-cellule">
              📚 {{ obtenirCreneau(jour, periode)?.cours }}

              <div class="infos">
                {{ obtenirCreneau(jour, periode)?.classe }}
                -
                {{ obtenirCreneau(jour, periode)?.local }}
              </div>

              <v-textarea
                v-if="mode === 'semainier'"
                :model-value="notes[cleNote(jour, periode)]"
                @update:model-value="(valeur) => modifierNote(jour, periode, String(valeur ?? ''))"
                density="compact"
                rows="2"
                placeholder="Ce que j'ai fait..."
                class="mt-1 champ-note"
                hide-details
              />
            </div>

            <div v-else-if="mode === 'edition'" class="plus">+</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import type { CreneauHoraire } from '@/stores/ecole'

const proprietes = withDefaults(
  defineProps<{
    creneaux: CreneauHoraire[]
    mode: 'edition' | 'semainier'
    notes?: Record<string, string>
    datesJours?: Record<string, string>
  }>(),
  {
    notes: () => ({}),
    datesJours: undefined,
  }
)

const emit = defineEmits<{
  (e: 'modifier-cellule', donnees: { jour: string; periode: number }): void
  (e: 'update:notes', notes: Record<string, string>): void
}>()

const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const periodes = Array.from({ length: 8 }, (_, i) => i + 1)

// Cherche le créneau (cours/classe/local) prévu pour un jour+période donnés.
function obtenirCreneau(jour: string, periode: number) {
  return proprietes.creneaux.find(c => c.day === jour && c.period === periode)
}

// En mode édition, cliquer sur une cellule ouvre le formulaire d'affectation
// de cours pour ce créneau (géré par le composant parent). Sans effet en
// mode "semainier" (lecture seule).
function gererClicCellule(jour: string, periode: number) {
  if (proprietes.mode !== 'edition') return
  emit('modifier-cellule', { jour, periode })
}

// Clé unique identifiant une note pour un créneau (jour + période).
function cleNote(jour: string, periode: number) {
  return `${jour}-${periode}`
}

// Met à jour la note d'un créneau (mode semainier) et prévient le parent
// via v-model (update:notes) pour qu'il persiste le changement.
function modifierNote(jour: string, periode: number, valeur: string) {
  emit('update:notes', { ...proprietes.notes, [cleNote(jour, periode)]: valeur })
}
</script>

<style scoped>
.conteneur-tableau {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
}

.tableau {
  width: 100%;
  min-width: 920px;
  table-layout: fixed;
  border-collapse: collapse;
  background: transparent;
}

/* ── En-têtes (jours) ── */
th {
  width: 150px;
  background: #10b981;
  color: white;
  padding: 12px;
  text-align: center;
  vertical-align: middle;
  line-height: 1.1;
}

.entete-periode,
.periode {
  width: 54px;
  min-width: 54px;
  max-width: 54px;
}

td {
  width: 150px;
  text-align: center;
  vertical-align: middle;
  line-height: 1;
}

/* ── Colonne périodes (P1, P2...) ── */
.periode {
  font-weight: bold;
  border: 1px solid #ddd;
}

/* Light mode */
.clair .periode {
  background: #10b981;
  color: white;
  border-color: #059669;
}

/* Dark mode */
.sombre .periode {
  background: #10b981;
  color: white;
  border-color: #2d5a8e;
}

/* ── Cellules ── */
.cellule {
  height: 90px;
  border: 1px solid #ddd;
  background: transparent;
  color: inherit;
  padding: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sombre .cellule {
  border-color: #334155;
  color: white;
}

.cellule.modifiable { cursor: pointer; }

.cellule.modifiable:hover {
  background: rgba(16, 185, 129, 0.12);
}

.contenu-cellule {
  height: 100%;
  overflow: hidden;
}

/* ── Texte dans les cellules en dark ── */
.sombre .infos {
  color: #94a3b8;
}

.plus {
  color: #10b981;
  font-size: 22px;
  font-weight: bold;
}

.infos {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.champ-note {
  max-height: 74px;
  overflow: hidden;
}

:deep(.champ-note textarea) {
  min-height: 52px !important;
  max-height: 52px !important;
  overflow-y: auto;
  resize: none;
}

/* Dark mode textarea */
.sombre :deep(.champ-note textarea) {
  color: white !important;
}
</style>

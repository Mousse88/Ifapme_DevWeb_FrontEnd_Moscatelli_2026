<template>
  <PageLayout titre="📅 Horaires" sous-titre="Gestion des horaires de cours">
    <template v-if="mode === 'planning'" #actions>
      <BoutonApp variante="secondary" @click="retourListe">← Retour</BoutonApp>
      <BoutonApp variante="echec" @click="demanderSuppressionHoraire">Supprimer</BoutonApp>
    </template>

    <div v-if="mode === 'liste'">
      <div class="grille">
        <v-card
          v-for="horaire in store.horaires"
          :key="horaire.id"
          class="carte"
          @click="ouvrirHoraire(horaire)"
        >
          <div class="font-weight-bold">{{ horaire.nom }}</div>
          <div class="text-caption">{{ horaire.startDate }} → {{ horaire.endDate }}</div>
        </v-card>
        <TuileAjoutHoraire @ajouter="ouvrirDialogueCreation" />
      </div>
    </div>

    <div v-else-if="horaireActuel">
      <v-card class="pa-4 mb-4">
        <v-card-title>Modifier l'horaire</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model="horaireActuel.nom" label="Nom de l'horaire" @update:model-value="sauvegardeAuto" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="horaireActuel.startDate" type="date" label="Début" @update:model-value="sauvegardeAuto" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="horaireActuel.endDate" type="date" label="Fin" @update:model-value="sauvegardeAuto" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <TableauHoraire
        :creneaux="horaireActuel.slots"
        mode="edition"
        @modifier-cellule="donnees => modifierCellule(donnees.jour, donnees.periode)"
      />
    </div>

    <!-- Dialogue création -->
    <v-dialog v-model="dialogueCreation" max-width="400">
      <v-card class="pa-4">
        <v-card-title>Nouvel horaire</v-card-title>
        <v-card-text>
          <v-text-field v-model="formulaire.nom" label="Nom" />
          <v-text-field v-model="formulaire.dateDebut" type="date" label="Début" />
          <v-text-field v-model="formulaire.dateFin" type="date" label="Fin" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <BoutonApp variante="secondary" @click="fermerDialogueCreation">Annuler</BoutonApp>
          <BoutonApp variante="primary" :disabled="!formulaireValide" @click="creerHoraire">Créer</BoutonApp>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogue modification cellule -->
    <v-dialog v-model="dialogueModification" max-width="450">
      <v-card class="pa-4">
        <v-card-title>Bloc horaire</v-card-title>
        <v-card-text>
          <v-select
            v-model="celluleSelectionnee.classe"
            :items="classesTri"
            item-title="nom"
            item-value="nom"
            label="Classe"
            @update:model-value="celluleSelectionnee.cours = ''"
          />
          <v-select
            v-model="celluleSelectionnee.cours"
            :items="coursDisponiblesPourClasse"
            label="Cours"
            :disabled="!celluleSelectionnee.classe"
          />
          <v-text-field v-model="celluleSelectionnee.local" label="Local" />
        </v-card-text>
        <v-card-actions>
          <BoutonApp v-if="celluleExiste" variante="echec" @click="supprimerCellule">Supprimer</BoutonApp>
          <v-spacer />
          <BoutonApp variante="secondary" @click="dialogueModification = false">Annuler</BoutonApp>
          <BoutonApp
            variante="primary"
            :disabled="!celluleSelectionnee.classe || !celluleSelectionnee.cours || !celluleSelectionnee.local.trim()"
            @click="enregistrerCellule"
          >OK</BoutonApp>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogue confirmation suppression horaire -->
    <v-dialog v-model="dialogueConfirmation" max-width="420" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-2 text-h6">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-5 pt-0">
          Supprimer l'horaire <strong>{{ horaireActuel?.nom }}</strong> ? Cette action est irréversible.
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 d-flex justify-end ga-2">
          <BoutonApp variante="secondary" @click="dialogueConfirmation = false">Annuler</BoutonApp>
          <BoutonApp variante="echec" @click="confirmerSuppression">Supprimer</BoutonApp>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbarVisible" :timeout="2000" color="success" location="bottom right">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      Horaire sauvegardé !
    </v-snackbar>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEcoleStore, type Horaire, type CreneauHoraire } from '@/stores/ecole'

import PageLayout from '@/components/Pagelayout.vue'
import BoutonApp from '@/components/BoutonApp.vue'
import TuileAjoutHoraire from '@/components/horaires/TuileAjoutHoraire.vue'
import TableauHoraire from '@/components/horaires/TableauHoraire.vue'

const store = useEcoleStore()

const mode = ref<'liste' | 'planning'>('liste')
const horaireActuel = ref<Horaire | null>(null)
const dialogueCreation = ref(false)
const dialogueModification = ref(false)
const dialogueConfirmation = ref(false)
const sauvegarde = ref(false)
const snackbarVisible = ref(false)

let timerSauvegarde: ReturnType<typeof setTimeout> | null = null

const formulaire = ref({ nom: '', dateDebut: '', dateFin: '' })
const formulaireValide = computed(() => formulaire.value.nom.trim().length > 0)

const celluleSelectionnee = ref<CreneauHoraire>({ day: '', period: 1, classe: '', cours: '', local: '' })

const celluleExiste = computed(() =>
  horaireActuel.value?.slots.some(c =>
    c.day === celluleSelectionnee.value.day &&
    c.period === celluleSelectionnee.value.period
  ) ?? false
)

const classesTri = computed(() => store.obtenirClassesTries())

const coursDisponiblesPourClasse = computed(() => {
  const classe = store.classes.find(c => c.nom === celluleSelectionnee.value.classe)
  if (!classe) return []
  return store.cours
    .filter(c => classe.coursIds.includes(c.id))
    .map(c => c.nom)
    .sort((a, b) => a.localeCompare(b, 'fr'))
})

async function sauvegardeAuto() {
  if (!horaireActuel.value?.nom.trim()) return
  if (timerSauvegarde) clearTimeout(timerSauvegarde)
  timerSauvegarde = setTimeout(async () => {
    await enregistrerHoraireActuel(false)
  }, 800)
}

function ouvrirDialogueCreation() {
  formulaire.value = { nom: '', dateDebut: '', dateFin: '' }
  dialogueCreation.value = true
}

function fermerDialogueCreation() {
  dialogueCreation.value = false
  formulaire.value = { nom: '', dateDebut: '', dateFin: '' }
}

async function creerHoraire() {
  if (!formulaireValide.value) return
  try {
    await store.ajouterHoraire({
      nom: formulaire.value.nom.trim(),
      startDate: formulaire.value.dateDebut || '',
      endDate: formulaire.value.dateFin || '',
      slots: []
    })
    await store.chargerHoraires()
    fermerDialogueCreation()
  } catch (e) {
    console.error('Erreur création:', e)
  }
}

function ouvrirHoraire(horaire: Horaire) {
  horaireActuel.value = { ...horaire, slots: horaire.slots.map(s => ({ ...s })) }
  mode.value = 'planning'
}

function retourListe() {
  mode.value = 'liste'
  horaireActuel.value = null
}

function modifierCellule(jour: string, periode: number) {
  const existante = horaireActuel.value?.slots.find(c => c.day === jour && c.period === periode)
  celluleSelectionnee.value = existante
    ? { ...existante }
    : { day: jour, period: periode, classe: '', cours: '', local: '' }
  dialogueModification.value = true
}

async function enregistrerCellule() {
  if (!horaireActuel.value) return
  const index = horaireActuel.value.slots.findIndex(c =>
    c.day === celluleSelectionnee.value.day &&
    c.period === celluleSelectionnee.value.period
  )
  if (index >= 0) horaireActuel.value.slots[index] = { ...celluleSelectionnee.value }
  else horaireActuel.value.slots.push({ ...celluleSelectionnee.value })
  dialogueModification.value = false
  await enregistrerHoraireActuel(false)
}

function supprimerCellule() {
  if (!horaireActuel.value) return
  horaireActuel.value.slots = horaireActuel.value.slots.filter(c =>
    !(c.day === celluleSelectionnee.value.day && c.period === celluleSelectionnee.value.period)
  )
  dialogueModification.value = false
  enregistrerHoraireActuel(false)
}

async function enregistrerHoraireActuel(afficherSnackbar = true) {
  if (!horaireActuel.value?.nom.trim()) return
  sauvegarde.value = true
  try {
    await store.modifierHoraire(horaireActuel.value.id, {
      ...horaireActuel.value,
      nom: horaireActuel.value.nom.trim()
    })
    if (afficherSnackbar) snackbarVisible.value = true
  } catch (e) {
    console.error('Erreur sauvegarde:', e)
  } finally {
    sauvegarde.value = false
  }
}

function demanderSuppressionHoraire() {
  dialogueConfirmation.value = true
}

async function confirmerSuppression() {
  if (!horaireActuel.value) return
  try {
    await store.supprimerHoraire(horaireActuel.value.id)
    await store.chargerHoraires()
    dialogueConfirmation.value = false
    mode.value = 'liste'
    horaireActuel.value = null
  } catch (e) {
    console.error('Erreur suppression:', e)
  }
}
</script>

<style scoped>
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.carte {
  padding: 16px;
  cursor: pointer;
  border-radius: 16px;
}
</style>
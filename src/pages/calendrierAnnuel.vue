<template>
  <PageLayout :titre="'📅 Calendrier Annuel ' + libelleAnneeScolaire" sous-titre="Vue d'ensemble de l'année scolaire">
    <template #actions>
      <BoutonApp variante="primary" @click="ouvrirDialogueCreation">+ Événement</BoutonApp>
    </template>

    <v-row>
      <CarteMoisCalendrier
        v-for="mois in moisCalendrier"
        :key="mois.nom"
        :mois="mois"
        :noms-jours="nomsJours"
        :evenements-pour-date="obtenirEvenementsPourDate"
        :titre-evenement="titreEvenement"
        @aller-semaine="allerVersSemaine"
        @modifier-evenement="ouvrirDialogueModification"
      />
    </v-row>

    <DialogueEvenement
      v-model:modeleOuvert="dialogue"
      :evenement-en-edition-id="evenementEnEditionId"
      :evenement="evenementEnEdition"
      @fermer="fermerDialogue"
      @enregistrer="enregistrerEvenement"
      @supprimer="demanderSuppressionEvenement"
    />

    <v-dialog v-model="dialogueConfirmation" max-width="420" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-2 text-h6">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-5 pt-0">
          {{ messageConfirmation }}
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 d-flex justify-end ga-2">
          <BoutonApp variante="secondary" @click="annulerSuppression">Annuler</BoutonApp>
          <BoutonApp variante="echec" @click="confirmerSuppression">Supprimer</BoutonApp>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useEcoleStore, type EvenementCalendrier } from '@/stores/ecole'
import { useParametresStore } from '@/stores/parametres'
import { utiliserCalendrier } from '@/composables/utiliserCalendrier'

import PageLayout from '@/components/Pagelayout.vue'
import BoutonApp from '@/components/BoutonApp.vue'
import CarteMoisCalendrier from '@/components/calendrierAnnuel/CarteMoisCalendrier.vue'
import DialogueEvenement from '@/components/calendrierAnnuel/DialogueEvenement.vue'

const router = useRouter()
const store = useEcoleStore()
const parametres = useParametresStore()
const { evenements } = storeToRefs(store)

const libelleAnneeScolaire = computed(() => parametres.libelleAnneeScolaire)
const anneeDebut = computed(() => parametres.anneeDebut)
const anneeFin = computed(() => parametres.anneeDebut + 1)

const ordreMois: number[] = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7]

const { nomsJours, construireMois, obtenirEvenementsPourDate, titreEvenement } = utiliserCalendrier(evenements)

const moisCalendrier = computed(() =>
  ordreMois.map(mois => {
    const annee = mois >= 8 ? anneeDebut.value : anneeFin.value
    return construireMois(mois, annee)
  })
)

const dialogue = ref(false)
const evenementEnEditionId = ref<number | null>(null)
const evenementEnEdition = ref<EvenementCalendrier | null>(null)

const dialogueConfirmation = ref(false)
const messageConfirmation = ref('')

function ouvrirDialogueCreation() {
  evenementEnEditionId.value = null
  evenementEnEdition.value = null
  dialogue.value = true
}

function ouvrirDialogueModification(evenement: EvenementCalendrier) {
  evenementEnEditionId.value = evenement.id
  evenementEnEdition.value = evenement
  dialogue.value = true
}

function fermerDialogue() {
  dialogue.value = false
  evenementEnEditionId.value = null
  evenementEnEdition.value = null
}

async function enregistrerEvenement(donneesEvenement: Omit<EvenementCalendrier, 'id'>) {
  if (evenementEnEditionId.value) await store.modifierEvenement(evenementEnEditionId.value, donneesEvenement)
  else await store.ajouterEvenement(donneesEvenement)
  fermerDialogue()
}

function demanderSuppressionEvenement() {
  if (!evenementEnEditionId.value) return
  messageConfirmation.value = `Supprimer l'événement "${evenementEnEdition.value?.titre}" ?`
  dialogueConfirmation.value = true
}

async function confirmerSuppression() {
  if (!evenementEnEditionId.value) return
  await store.supprimerEvenement(evenementEnEditionId.value)
  annulerSuppression()
  fermerDialogue()
}

function annulerSuppression() {
  dialogueConfirmation.value = false
  messageConfirmation.value = ''
}

// Fix fuseau horaire : on passe une date locale sans conversion UTC
function allerVersSemaine(date: Date) {
  const dateIso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  router.push({ name: 'semainier', query: { date: dateIso } })
}
</script>
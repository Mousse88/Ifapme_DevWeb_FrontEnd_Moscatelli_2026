<template>
  <PageLayout titre="📚 Fiches élèves" sous-titre="Gestion des cours, classes et étudiants">
    <template #actions>
      <BoutonApp variante="primary" icone="mdi-book-plus" @click="ouvrirDialogueCours()">Cours</BoutonApp>
      <BoutonApp variante="primary" icone="mdi-google-classroom" :disabled="store.cours.length === 0" @click="ouvrirDialogueClasse()">Classe</BoutonApp>
      <BoutonApp variante="primary" icone="mdi-account-plus" :disabled="store.classes.length === 0" @click="ouvrirDialogueEleve()">Élève</BoutonApp>
    </template>

    <ListeCours
      :cours="coursTries"
      :nombre-classes-par-cours="nombreClassesParCours"
      @modifier-cours="ouvrirDialogueCours"
      @supprimer-cours="demanderSuppressionCours"
    />

    <ListeClasses
      :classes="classesTriees"
      :eleves-par-classe="elevesParClasse"
      :obtenir-nom-cours="obtenirNomCours"
      @ajouter-eleve="classeId => ouvrirDialogueEleve(undefined, classeId)"
      @modifier-classe="ouvrirDialogueClasse"
      @supprimer-classe="demanderSuppressionClasse"
      @modifier-eleve="ouvrirDialogueEleve"
      @supprimer-eleve="demanderSuppressionEleve"
    />

    <DialogueCours
      v-model:modele-ouvert="dialogueCours"
      :cours-en-edition-id="coursEnEditionId"
      :nom-cours="nouveauCours.nom"
      @fermer="fermerDialogueCours"
      @enregistrer="enregistrerCours"
    />

    <DialogueClasse
      v-model:modele-ouvert="dialogueClasse"
      :classe-en-edition-id="classeEnEditionId"
      :nom-classe="nouvelleClasse.nom"
      :cours-ids="nouvelleClasse.coursIds"
      :cours="coursTries"
      @fermer="fermerDialogueClasse"
      @enregistrer="enregistrerClasse"
    />

    <DialogueEleve
      v-model:modele-ouvert="dialogueEleve"
      :eleve-en-edition-id="eleveEnEditionId"
      :classe-id="nouvelEleve.classeId"
      :nom="nouvelEleve.nom"
      :prenom="nouvelEleve.prenom"
      :date-naissance="nouvelEleve.dateNaissance"
      :classes="classesTriees"
      @fermer="fermerDialogueEleve"
      @enregistrer="enregistrerEleve"
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
import { ref, computed } from 'vue'
import { useEcoleStore, type Cours, type Classe, type Eleve } from '@/stores/ecole'

import PageLayout from '@/components/Pagelayout.vue'
import BoutonApp from '@/components/BoutonApp.vue'
import ListeCours from '@/components/fichesEleves/ListeCours.vue'
import ListeClasses from '@/components/fichesEleves/ListeClasses.vue'
import DialogueCours from '@/components/fichesEleves/DialogueCours.vue'
import DialogueClasse from '@/components/fichesEleves/DialogueClasse.vue'
import DialogueEleve from '@/components/fichesEleves/DialogueEleve.vue'

const store = useEcoleStore()

const dialogueCours = ref(false)
const dialogueClasse = ref(false)
const dialogueEleve = ref(false)

const coursEnEditionId = ref<number | null>(null)
const classeEnEditionId = ref<number | null>(null)
const eleveEnEditionId = ref<number | null>(null)

const nouveauCours = ref({ nom: '' })
const nouvelleClasse = ref({ nom: '', coursIds: [] as number[] })
const nouvelEleve = ref({ classeId: 0, nom: '', prenom: '', dateNaissance: '' })

const dialogueConfirmation = ref(false)
const messageConfirmation = ref('')
let actionSuppression: (() => Promise<void>) | null = null

const coursTries = computed(() => store.obtenirCoursTries())
const classesTriees = computed(() => store.obtenirClassesTries())

function elevesParClasse(classeId: number) {
  return store.obtenirElevesParClasse(classeId)
}

function nombreClassesParCours(coursId: number) {
  return store.classes.filter(c => c.coursIds.includes(coursId)).length
}

function obtenirNomCours(coursIds: number[]) {
  return coursTries.value.filter(c => coursIds.includes(c.id)).map(c => c.nom).join(', ')
}

function demanderSuppressionCours(id: number) {
  const cours = store.cours.find(c => c.id === id)
  const nbClasses = nombreClassesParCours(id)
  messageConfirmation.value = `Supprimer le cours "${cours?.nom}"${nbClasses > 0 ? ` (utilisé dans ${nbClasses} classe(s))` : ''} ?`
  actionSuppression = () => store.supprimerCours(id)
  dialogueConfirmation.value = true
}

function demanderSuppressionClasse(id: number) {
  const classe = store.classes.find(c => c.id === id)
  const nbEleves = elevesParClasse(id).length
  messageConfirmation.value = `Supprimer la classe "${classe?.nom}"${nbEleves > 0 ? ` et ses ${nbEleves} élève(s)` : ''} ?`
  actionSuppression = () => store.supprimerClasse(id)
  dialogueConfirmation.value = true
}

function demanderSuppressionEleve(id: number) {
  const eleve = store.eleves.find(e => e.id === id)
  messageConfirmation.value = `Supprimer l'élève "${eleve?.nom} ${eleve?.prenom}" ?`
  actionSuppression = () => store.supprimerEleve(id)
  dialogueConfirmation.value = true
}

async function confirmerSuppression() {
  if (actionSuppression) await actionSuppression()
  annulerSuppression()
}

function annulerSuppression() {
  dialogueConfirmation.value = false
  messageConfirmation.value = ''
  actionSuppression = null
}

function ouvrirDialogueCours(cours?: Cours) {
  coursEnEditionId.value = cours?.id ?? null
  nouveauCours.value = { nom: cours?.nom ?? '' }
  dialogueCours.value = true
}

function fermerDialogueCours() {
  dialogueCours.value = false
  coursEnEditionId.value = null
  nouveauCours.value = { nom: '' }
}

async function enregistrerCours(nom: string) {
  if (!nom.trim()) return
  if (coursEnEditionId.value) {
    await store.modifierCours(coursEnEditionId.value, nom)
    await store.chargerHoraires() // ← recharge les horaires avec les nouveaux noms
  } else {
    await store.ajouterCours(nom)
  }
  fermerDialogueCours()
}

function ouvrirDialogueClasse(classe?: Classe) {
  classeEnEditionId.value = classe?.id ?? null
  nouvelleClasse.value = { nom: classe?.nom ?? '', coursIds: classe ? [...classe.coursIds] : [] }
  dialogueClasse.value = true
}

function fermerDialogueClasse() {
  dialogueClasse.value = false
  classeEnEditionId.value = null
  nouvelleClasse.value = { nom: '', coursIds: [] }
}

async function enregistrerClasse(donnees: { nom: string; coursIds: number[] }) {
  if (!donnees.nom.trim() || donnees.coursIds.length === 0) return
  if (classeEnEditionId.value) await store.modifierClasse(classeEnEditionId.value, donnees.nom, [...donnees.coursIds])
  else await store.ajouterClasse(donnees.nom, [...donnees.coursIds])
  fermerDialogueClasse()
}

function ouvrirDialogueEleve(eleve?: Eleve, classeId?: number) {
  eleveEnEditionId.value = eleve?.id ?? null
  nouvelEleve.value = eleve
    ? { classeId: eleve.classeId, nom: eleve.nom, prenom: eleve.prenom, dateNaissance: eleve.dateNaissance }
    : { classeId: classeId ?? store.classes[0]?.id ?? 0, nom: '', prenom: '', dateNaissance: '' }
  dialogueEleve.value = true
}

function fermerDialogueEleve() {
  dialogueEleve.value = false
  eleveEnEditionId.value = null
  nouvelEleve.value = { classeId: 0, nom: '', prenom: '', dateNaissance: '' }
}

async function enregistrerEleve(donnees: { classeId: number; nom: string; prenom: string; dateNaissance: string }) {
  if (!donnees.classeId || !donnees.nom.trim() || !donnees.prenom.trim()) return
  if (eleveEnEditionId.value) await store.modifierEleve(eleveEnEditionId.value, donnees.classeId, donnees.nom, donnees.prenom, donnees.dateNaissance)
  else await store.ajouterEleve(donnees.classeId, donnees.nom, donnees.prenom, donnees.dateNaissance)
  fermerDialogueEleve()
}
</script>
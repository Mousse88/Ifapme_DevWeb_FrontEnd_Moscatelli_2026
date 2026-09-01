<!--
  Popup de création/modification d'un événement du calendrier annuel
  (congé, formation, réunion...). Le même formulaire sert pour les deux
  cas : s'il y a un evenementEnEditionId, on est en mode modification
  (avec bouton Supprimer), sinon en mode création.
-->
<template>
  <v-dialog
    :model-value="modeleOuvert"
    max-width="520"
    @update:model-value="(valeur) => emit('update:modeleOuvert', valeur)"
  >
    <v-card class="carte-dialogue">
      <v-card-title>
        {{ evenementEnEditionId ? "Modifier l'événement" : "Nouvel événement" }}
      </v-card-title>

      <v-card-text>
        <v-text-field v-model="formulaire.titre" label="Titre" />

        <v-select
          v-model="formulaire.type"
          :items="typesEvenements"
          item-title="label"
          item-value="value"
          label="Type"
        />

        <div class="d-flex align-center mt-3 mb-4">
          <span class="mr-3">Couleur :</span>
          <div class="d-flex ga-2">
            <div
              v-for="couleur in couleurs"
              :key="couleur"
              class="pastille-couleur"
              :style="{ backgroundColor: couleur }"
              :class="{ selectionnee: formulaire.couleur === couleur }"
              @click="formulaire.couleur = couleur"
            />
          </div>
        </div>

        <v-checkbox v-model="formulaire.jourEntier" label="Journée entière" />

        <v-text-field
          v-model="formulaire.dateDebut"
          type="date"
          label="Date de début"
          :min="dateMin"
          :max="dateMax"
          @update:model-value="onDateDebutChange"
        />

        <v-text-field
          v-if="!formulaire.jourEntier"
          v-model="formulaire.heureDebut"
          type="time"
          label="Heure de début"
        />

        <v-text-field
          v-model="formulaire.dateFin"
          type="date"
          label="Date de fin"
          :min="formulaire.dateDebut || dateMin"
          :max="dateMax"
        />

        <v-text-field
          v-if="!formulaire.jourEntier"
          v-model="formulaire.heureFin"
          type="time"
          label="Heure de fin"
        />

        <v-text-field
          v-model="formulaire.emplacement"
          label="Emplacement"
          placeholder="Ex: Local 204, école, extérieur..."
        />

        <v-textarea
          v-model="formulaire.description"
          label="Description"
          rows="3"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="evenementEnEditionId"
          color="error"
          variant="text"
          @click="emit('supprimer')"
        >
          Supprimer
        </v-btn>

        <v-spacer />

        <v-btn variant="text" @click="emit('fermer')">Annuler</v-btn>

        <v-btn color="primary" @click="validerFormulaire">
          {{ evenementEnEditionId ? "Modifier" : "Créer" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { EvenementCalendrier } from '@/stores/ecole'
import { useParametresStore } from '@/stores/parametres'

const proprietes = defineProps<{
  modeleOuvert: boolean
  evenementEnEditionId: number | null
  evenement?: EvenementCalendrier | null
}>()

const emit = defineEmits<{
  (e: 'update:modeleOuvert', valeur: boolean): void
  (e: 'enregistrer', donnees: Omit<EvenementCalendrier, 'id'>): void
  (e: 'fermer'): void
  (e: 'supprimer'): void
}>()

const parametres = useParametresStore()

// Limites de dates : 1er août anneeDebut → 31 juillet anneeFin
// (on ne peut pas créer un événement en dehors de l'année scolaire en cours).
const dateMin = computed(() => `${parametres.anneeDebut}-08-01`)
const dateMax = computed(() => `${parametres.anneeDebut + 1}-07-31`)

const typesEvenements = [
  { label: 'Congé', value: 'conge' },
  { label: 'Formation', value: 'formation' },
  { label: 'Réunion', value: 'reunion' },
  { label: 'Autre', value: 'autre' },
]

const couleurs = ['#10b981', '#ef4444', '#2563eb', '#f97316', '#a855f7', '#6b7280']

// État local du formulaire, séparé des props pour pouvoir être édité
// librement avant validation (on ne modifie pas directement l'événement du store).
const formulaire = reactive({
  titre: '',
  type: 'conge',
  jourEntier: true,
  dateDebut: '',
  dateFin: '',
  heureDebut: '',
  heureFin: '',
  emplacement: '',
  description: '',
  couleur: '#10b981',
})

// Si l'utilisateur change la date de début et que la date de fin devient
// incohérente (vide ou antérieure), on l'aligne automatiquement sur le début.
function onDateDebutChange(nouvelleDate: string) {
  if (!formulaire.dateFin || formulaire.dateFin < nouvelleDate) {
    formulaire.dateFin = nouvelleDate
  }
}

// À chaque ouverture de la popup, on réinitialise le formulaire puis,
// si un événement est fourni en prop (mode édition), on pré-remplit
// les champs avec ses valeurs actuelles.
watch(
  () => proprietes.modeleOuvert,
  (ouvert) => {
    if (!ouvert) return
    reinitialiserFormulaire()
    const evenement = proprietes.evenement
    if (!evenement) return
    formulaire.titre = evenement.titre
    formulaire.type = evenement.type
    formulaire.jourEntier = evenement.jourEntier
    formulaire.dateDebut = evenement.dateDebut
    formulaire.dateFin = evenement.dateFin
    formulaire.heureDebut = evenement.heureDebut ?? ''
    formulaire.heureFin = evenement.heureFin ?? ''
    formulaire.emplacement = evenement.emplacement ?? ''
    formulaire.description = evenement.description ?? ''
    formulaire.couleur = evenement.couleur ?? '#10b981'
  }
)

// Remet le formulaire à ses valeurs vides par défaut (mode création).
function reinitialiserFormulaire() {
  formulaire.titre = ''
  formulaire.type = 'conge'
  formulaire.jourEntier = true
  formulaire.dateDebut = ''
  formulaire.dateFin = ''
  formulaire.heureDebut = ''
  formulaire.heureFin = ''
  formulaire.emplacement = ''
  formulaire.description = ''
  formulaire.couleur = '#10b981'
}

// Valide les champs obligatoires et la cohérence des dates avant d'émettre
// l'événement "enregistrer" avec les données prêtes à envoyer à l'API.
function validerFormulaire() {
  if (!formulaire.titre.trim()) {
    alert('Le titre est obligatoire')
    return
  }
  if (!formulaire.dateDebut) {
    alert('La date de début est obligatoire')
    return
  }

  const dateFin = formulaire.dateFin || formulaire.dateDebut
  if (dateFin < formulaire.dateDebut) {
    alert('La date de fin ne peut pas être avant la date de début !')
    return
  }

  emit('enregistrer', {
    titre: formulaire.titre.trim(),
    type: formulaire.type,
    jourEntier: formulaire.jourEntier,
    dateDebut: formulaire.dateDebut,
    dateFin: dateFin,
    heureDebut: formulaire.jourEntier ? null : formulaire.heureDebut || null,
    heureFin: formulaire.jourEntier ? null : formulaire.heureFin || null,
    emplacement: formulaire.emplacement || null,
    description: formulaire.description || null,
    couleur: formulaire.couleur,
    anneeDebut: parametres.anneeDebut,
  })
}
</script>

<style scoped>
.carte-dialogue { border-radius: 16px; }

.pastille-couleur {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
}

.pastille-couleur.selectionnee {
  border: 2px solid #111827;
  transform: scale(1.12);
}
</style>

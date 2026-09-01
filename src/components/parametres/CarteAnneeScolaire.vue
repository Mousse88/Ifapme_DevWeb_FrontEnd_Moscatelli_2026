<!--
  Carte des paramètres "Année scolaire" : permet de choisir quelle année
  consulter (parmi celles déjà créées) et de démarrer une nouvelle année
  scolaire (avec une popup de confirmation qui exige de retaper l'année,
  pour éviter un clic accidentel qui archiverait l'année en cours par erreur).
-->
<template>
  <v-card class="pa-5 carte-parametre" rounded="xl" :class="estSombre ? 'carte-sombre' : 'carte-claire'">
    <div class="d-flex align-center mb-4 ga-3">
      <v-icon size="28" color="success">mdi-calendar-school</v-icon>
      <h2 class="text-h6 font-weight-bold">Année scolaire</h2>
    </div>

    <!-- Sélecteur année consultée -->
    <div class="d-flex align-center ga-4 mb-4 flex-wrap">
      <div style="min-width: 180px">
        <label class="libelle-champ">Année consultée</label>
        <v-select
          :model-value="store.anneeConsultee"
          :items="anneesDisponibles"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="onChangerAnnee"
        />
      </div>

      <div class="pt-4 d-flex ga-3 flex-wrap">
        <v-chip color="success" variant="tonal" size="large">
          <v-icon start>mdi-check-circle</v-icon>
          Année active : {{ store.libelleAnneeEnCours }}
        </v-chip>

        <v-chip v-if="!store.estAnneeEnCours" color="warning" variant="tonal" size="large">
          <v-icon start>mdi-eye</v-icon>
          Lecture seule
        </v-chip>
      </div>
    </div>

    <!-- Alerte lecture seule -->
    <v-alert
      v-if="!store.estAnneeEnCours"
      type="info"
      variant="tonal"
      class="mb-5"
    >
      Tu consultes l'année <strong>{{ store.libelleAnneeScolaire }}</strong>.
      Les données sont en lecture seule. Pour modifier des données,
      reviens sur l'année active <strong>{{ store.libelleAnneeEnCours }}</strong>.
    </v-alert>

    <v-divider class="mb-5" />

    <!-- Bouton nouvelle année -->
    <div>
      <h3 class="text-subtitle-1 font-weight-bold mb-2">🔄 Nouvelle année scolaire</h3>
      <p class="description mb-4">
        Démarre une nouvelle année scolaire. Les données de l'année en cours sont
        <strong>conservées</strong> et consultables en lecture seule via le sélecteur ci-dessus.
      </p>

      <v-btn
        color="warning"
        variant="tonal"
        @click="dialogueNouvelleAnnee = true"
      >
        <v-icon start>mdi-archive-arrow-up</v-icon>
        Démarrer {{ store.anneeDebut + 1 }}-{{ store.anneeDebut + 2 }}
      </v-btn>
    </div>

    <!-- Dialogue confirmation nouvelle année -->
    <v-dialog v-model="dialogueNouvelleAnnee" max-width="480">
      <v-card class="pa-4" rounded="xl">
        <v-card-title class="text-h6 font-weight-bold mb-2">
          🗓️ Nouvelle année scolaire
        </v-card-title>

        <v-card-text>
          <v-alert type="success" variant="tonal" class="mb-4">
            Les données de <strong>{{ store.libelleAnneeEnCours }}</strong> seront
            <strong>conservées</strong> et accessibles en lecture seule.
            Tu pourras y revenir à tout moment via le sélecteur d'année.
          </v-alert>

          <p class="mb-3">La nouvelle année démarrera avec :</p>
          <ul class="liste-reset mb-4">
            <li>📚 Cours et classes vierges</li>
            <li>👥 Aucun élève</li>
            <li>📅 Aucun horaire</li>
            <li>📝 Aucune cote</li>
            <li>📋 Aucune présence</li>
            <li>📆 Aucun événement calendrier</li>
          </ul>

          <v-text-field
            v-model="confirmationTexte"
            :label="'Tape ' + (store.anneeDebut + 1) + ' pour confirmer'"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="fermerDialogue">Annuler</v-btn>
          <v-btn
            color="warning"
            :disabled="confirmationTexte !== String(store.anneeDebut + 1)"
            :loading="chargement"
            @click="demarrerNouvelleAnnee"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useParametresStore } from '@/stores/parametres'

const emit = defineEmits<{
  nouvelleAnnee: []
  changerAnnee: []
}>()

const store = useParametresStore()
const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)

const dialogueNouvelleAnnee = ref(false)
// L'utilisateur doit retaper l'année cible pour confirmer (sécurité anti-clic accidentel).
const confirmationTexte = ref('')
const chargement = ref(false)

// Liste des années sélectionnables dans le menu déroulant, la plus récente en premier,
// avec un libellé "(active)" pour l'année scolaire actuellement en cours.
const anneesDisponibles = computed(() =>
  [...store.anneesCreees]
    .sort((a, b) => b - a) // plus récente en premier
    .map(annee => ({
      title: `${annee}-${annee + 1}${annee === store.anneeDebut ? ' (active)' : ''}`,
      value: annee,
    }))
)

// Change l'année consultée et prévient le parent pour qu'il recharge les données.
function onChangerAnnee(annee: number) {
  store.consulterAnnee(annee)
  emit('changerAnnee')
}

function fermerDialogue() {
  dialogueNouvelleAnnee.value = false
  confirmationTexte.value = ''
}

// Démarre la nouvelle année scolaire (via le store) puis prévient le parent
// pour qu'il recharge les données fraîches de cette nouvelle année.
async function demarrerNouvelleAnnee() {
  chargement.value = true
  try {
    await store.demarrerNouvelleAnnee(store.anneeDebut + 1)
    emit('nouvelleAnnee')
    fermerDialogue()
  } finally {
    chargement.value = false
  }
}
</script>

<style scoped>
.liste-reset {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
</style>

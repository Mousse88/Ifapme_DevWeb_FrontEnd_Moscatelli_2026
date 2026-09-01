<!--
  Popup de création/modification d'un élève : classe, nom, prénom et
  date de naissance.
-->
<template>
  <v-dialog
    :model-value="modeleOuvert"
    max-width="400"
    @update:model-value="$emit('update:modeleOuvert', $event)"
  >
    <v-card class="carte-dialogue">
      <v-card-title>
        {{ eleveEnEditionId ? "Modifier un élève" : "Ajouter un élève" }}
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="eleveLocal.classeId"
          :items="classes"
          item-title="nom"
          item-value="id"
          label="Classe"
        />

        <v-text-field v-model="eleveLocal.nom" label="Nom" />
        <v-text-field v-model="eleveLocal.prenom" label="Prénom" />

        <v-text-field
          v-model="eleveLocal.dateNaissance"
          label="Date de naissance"
          type="date"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="$emit('fermer')"> Annuler </v-btn>

        <v-btn
          class="bouton-succes"
          :disabled="
            !eleveLocal.classeId ||
            !eleveLocal.nom.trim() ||
            !eleveLocal.prenom.trim()
          "
          @click="
            $emit('enregistrer', {
              classeId: eleveLocal.classeId,
              nom: eleveLocal.nom,
              prenom: eleveLocal.prenom,
              dateNaissance: eleveLocal.dateNaissance,
            })
          "
        >
          {{ eleveEnEditionId ? "Modifier" : "Ajouter" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { Classe } from "@/stores/ecole";

const proprietes = defineProps<{
  modeleOuvert: boolean;
  eleveEnEditionId: number | null;
  classeId: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  classes: Classe[];
}>();

defineEmits<{
  (e: "update:modeleOuvert", valeur: boolean): void;
  (e: "fermer"): void;
  (
    e: "enregistrer",
    donnees: {
      classeId: number;
      nom: string;
      prenom: string;
      dateNaissance: string;
    },
  ): void;
}>();

const eleveLocal = reactive({
  classeId: 0,
  nom: "",
  prenom: "",
  dateNaissance: "",
});

// À l'ouverture de la popup :
// - en mode édition -> pré-remplit avec les infos de l'élève à modifier
// - en mode création -> repart de zéro, en présélectionnant la classe
//   déjà ouverte dans la liste (ou la première classe disponible sinon)
watch(
  () => proprietes.modeleOuvert,
  (ouvert) => {
    if (!ouvert) return;

    if (proprietes.eleveEnEditionId) {
      eleveLocal.classeId = proprietes.classeId;
      eleveLocal.nom = proprietes.nom;
      eleveLocal.prenom = proprietes.prenom;
      eleveLocal.dateNaissance = proprietes.dateNaissance;
    } else {
      eleveLocal.classeId =
        proprietes.classeId || proprietes.classes[0]?.id || 0;
      eleveLocal.nom = "";
      eleveLocal.prenom = "";
      eleveLocal.dateNaissance = "";
    }
  },
);

// Garde le formulaire synchronisé si les props changent pendant l'édition
// (utile si les données de l'élève sont mises à jour ailleurs pendant que
// la popup est ouverte).
watch(
  () => [
    proprietes.classeId,
    proprietes.nom,
    proprietes.prenom,
    proprietes.dateNaissance,
  ],
  () => {
    if (!proprietes.eleveEnEditionId) return;

    eleveLocal.classeId = proprietes.classeId;
    eleveLocal.nom = proprietes.nom;
    eleveLocal.prenom = proprietes.prenom;
    eleveLocal.dateNaissance = proprietes.dateNaissance;
  },
);
</script>

<style scoped>
.bouton-succes {
  background: #f97316;
  color: white;
}

</style>

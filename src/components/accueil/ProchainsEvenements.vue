<!--
  Étape 1 du cahier de cotes : grille de cartes permettant de choisir
  la classe pour laquelle on veut consulter/encoder les cotes.
-->
<template>
  <div class="mb-6">
    <h2 class="text-h5 font-weight-bold mb-4">Mes classes</h2>

    <div v-if="classes.length === 0" class="text-medium-emphasis">
      Aucune classe disponible.
    </div>

    <div v-else class="grille">
      <v-card
        v-for="classe in classes"
        :key="classe.id"
        class="pa-4 rounded-xl elevation-2 carte-tuile curseur"
        :class="{ selectionnee: classeSelectionneeId === classe.id }"
        @click="$emit('selectionner-classe', classe.id)"
      >
        <div class="text-h6 font-weight-bold">{{ classe.nom }}</div>

        <div class="text-body-2 text-medium-emphasis">
          {{ obtenirNomCours(classe.coursIds) }}
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Classe } from "@/stores/ecole";

// "obtenirNomCours" est passée en prop par le composant parent : elle
// convertit une liste d'ids de cours en texte lisible (noms séparés par virgule).
defineProps<{
  classes: Classe[];
  classeSelectionneeId: number | null;
  obtenirNomCours: (coursIds: number[]) => string;
}>();

// Prévient le parent qu'une classe a été cliquée, pour passer à l'étape suivante.
defineEmits<{
  (e: "selectionner-classe", classeId: number): void;
}>();
</script>

<style scoped>
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.carte-tuile {
  transition: all 0.2s ease;
}

.carte-tuile:hover {
  transform: translateY(-2px);
}

.curseur {
  cursor: pointer;
}

.selectionnee {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>

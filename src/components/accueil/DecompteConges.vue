<!--
  Widget de la page d'accueil qui affiche un décompte des congés scolaires
  à venir ou en cours (ex: "dans 3 jours", "en cours, encore 2 jours").
-->
<template>
  <v-col cols="12" md="6">
    <v-card class="pa-4" rounded="xl">
      <h2 class="text-h6 mb-4">🏖️ Décompte congés scolaires</h2>

      <v-list v-if="decomptesConges.length">
        <v-list-item v-for="conge in decomptesConges" :key="conge.id">
          <v-list-item-title>{{ conge.titre }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ conge.message }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <p v-else class="etat-vide">Aucun congé scolaire encodé.</p>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useEcoleStore } from "@/stores/ecole";

const store = useEcoleStore();

const aujourdhui = new Date();
aujourdhui.setHours(0, 0, 0, 0);

// Charge les événements si pas déjà en mémoire.
onMounted(async () => {
  if (store.evenements.length === 0) {
    await store.chargerEvenements();
  }
});

// Ne garde que les événements de type "congé", calcule pour chacun
// un message adapté selon qu'il est à venir, en cours ou déjà terminé,
// puis exclut les congés terminés et trie par date de début.
const decomptesConges = computed(() => {
  return store.evenements
    .filter((evenement) => evenement.type === "conge")
    .map((evenement) => {
      const debut = analyserDate(evenement.dateDebut);
      const fin = analyserDate(evenement.dateFin);

      const joursAvant = differenceJours(aujourdhui, debut);
      const joursRestants = differenceJours(aujourdhui, fin);

      let message = "";

      if (aujourdhui < debut) {
        message = `dans ${joursAvant} jour${joursAvant > 1 ? "s" : ""}`;
      } else if (aujourdhui >= debut && aujourdhui <= fin) {
        message = `en cours, encore ${joursRestants} jour${joursRestants > 1 ? "s" : ""}`;
      } else {
        message = "terminé";
      }

      return {
        ...evenement,
        message,
      };
    })
    .filter((evenement) => evenement.message !== "terminé")
    .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
    .slice(0, 5);
});

// Convertit une chaîne de date en objet Date "arrondi" à minuit,
// pour pouvoir comparer des jours sans se soucier de l'heure.
function analyserDate(valeur: string) {
  const date = new Date(valeur);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Calcule le nombre de jours entre deux dates (arrondi au jour supérieur).
function differenceJours(depart: Date, arrivee: Date) {
  const unJour = 1000 * 60 * 60 * 24;
  return Math.ceil((arrivee.getTime() - depart.getTime()) / unJour);
}
</script>

<style scoped>

</style>

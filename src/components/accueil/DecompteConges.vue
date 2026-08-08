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

onMounted(async () => {
  if (store.evenements.length === 0) {
    await store.chargerEvenements();
  }
});

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
    .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
});

function analyserDate(valeur: string) {
  const date = new Date(valeur);
  date.setHours(0, 0, 0, 0);
  return date;
}

function differenceJours(depart: Date, arrivee: Date) {
  const unJour = 1000 * 60 * 60 * 24;
  return Math.ceil((arrivee.getTime() - depart.getTime()) / unJour);
}
</script>

<style scoped>

</style>

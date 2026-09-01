<!--
  Widget de la page d'accueil : version compacte du calendrier mensuel,
  réutilise le composant CarteMoisCalendrier (mode "compact") pour afficher
  le mois en cours avec les événements dessus.
-->
<template>
  <CarteMoisCalendrier
    :mois="moisCourant"
    :noms-jours="nomsJours"
    :evenements-pour-date="obtenirEvenementsPourDate"
    :titre-evenement="titreEvenement"
    compact
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useEcoleStore } from "@/stores/ecole";
import { utiliserCalendrier } from "@/composables/utiliserCalendrier";
import CarteMoisCalendrier from "@/components/calendrierAnnuel/CarteMoisCalendrier.vue";

const store = useEcoleStore();

// Charge les événements si pas déjà en mémoire.
onMounted(async () => {
  if (store.evenements.length === 0) {
    await store.chargerEvenements();
  }
});

// Le composable utiliserCalendrier fait tout le travail de construction
// de la grille du mois et de recherche des événements par date.
const {
  nomsJours,
  construireMoisCourant,
  obtenirEvenementsPourDate,
  titreEvenement,
} = utiliserCalendrier(store.evenements);

const moisCourant = computed(() => construireMoisCourant());
</script>

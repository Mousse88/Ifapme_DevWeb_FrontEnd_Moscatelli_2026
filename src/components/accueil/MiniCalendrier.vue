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

onMounted(async () => {
  if (store.evenements.length === 0) {
    await store.chargerEvenements();
  }
});

const {
  nomsJours,
  construireMoisCourant,
  obtenirEvenementsPourDate,
  titreEvenement,
} = utiliserCalendrier(store.evenements);

const moisCourant = computed(() => construireMoisCourant());
</script>

<template>
  <v-col cols="12" md="6">
    <v-card class="pa-4" rounded="xl">
      <h2 class="text-h6 mb-4">📌 Prochains rendez-vous</h2>

      <v-list v-if="prochainsEvenements.length">
        <v-list-item
          v-for="evenement in prochainsEvenements"
          :key="evenement.id"
        >
          <v-list-item-title>{{ evenement.titre }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ formaterDateLongue(evenement.dateDebut) }}
            <span v-if="evenement.heureDebut">à {{ evenement.heureDebut }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <p v-else class="etat-vide">Aucun rendez-vous à venir.</p>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useEcoleStore } from "@/stores/ecole";
import { aujourdHui } from "@/composables/utiliserDate";

const store = useEcoleStore();

onMounted(async () => {
  if (store.evenements.length === 0) {
    await store.chargerEvenements();
  }
});

const prochainsEvenements = computed(() => {
  return store.evenements
    .filter(
      (evenement) =>
        evenement.type !== "conge" &&
        evenement.dateDebut >= aujourdHui(),
    )
    .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
    .slice(0, 5);
});

function formaterDateLongue(valeur: string) {
  return new Date(valeur).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
</script>

<style scoped>
</style>
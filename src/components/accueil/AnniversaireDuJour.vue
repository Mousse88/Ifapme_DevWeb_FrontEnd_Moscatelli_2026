<template>
  <v-col cols="12" md="6">
    <v-card class="pa-4" rounded="xl">
      <h2 class="text-h6 mb-4">🎂 Anniversaires du jour</h2>

      <v-list v-if="anniversairesDuJour.length">
        <v-list-item v-for="eleve in anniversairesDuJour" :key="eleve.id">
          <v-list-item-title>
            Anniversaire de {{ eleve.prenom }} {{ eleve.nom }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ calculerAge(eleve.dateNaissance) }} ans aujourd’hui 🎉
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <p v-else class="etat-vide">Aucun anniversaire aujourd’hui.</p>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useEcoleStore } from "@/stores/ecole";

const store = useEcoleStore();

const aujourdhui = new Date();

onMounted(async () => {
  if (store.eleves.length === 0) {
    await store.chargerEleves();
  }
});

const anniversairesDuJour = computed(() => {
  const jour = aujourdhui.getDate();
  const mois = aujourdhui.getMonth();

  return store.eleves.filter((eleve) => {
    if (!eleve.dateNaissance) return false;

    const naissance = new Date(eleve.dateNaissance);

    return naissance.getDate() === jour && naissance.getMonth() === mois;
  });
});

function calculerAge(dateNaissance: string) {
  const naissance = new Date(dateNaissance);

  let age = aujourdhui.getFullYear() - naissance.getFullYear();

  const anniversairePasse =
    aujourdhui.getMonth() > naissance.getMonth() ||
    (aujourdhui.getMonth() === naissance.getMonth() &&
      aujourdhui.getDate() >= naissance.getDate());

  if (!anniversairePasse) {
    age--;
  }

  return age;
}
</script>

<style scoped>

</style>

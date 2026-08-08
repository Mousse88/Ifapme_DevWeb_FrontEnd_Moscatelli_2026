<template>
  <v-col cols="12" md="6">
    <v-card class="pa-4" rounded="xl">
      <h2 class="text-h6 mb-4">📚 Horaire d'aujourd'hui</h2>

      <v-list v-if="creneauxDuJour.length">
        <v-list-item v-for="creneau in creneauxDuJour" :key="creneau.period">
          <v-list-item-title>
            P{{ creneau.period }} — {{ creneau.cours }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ creneau.classe }} • local {{ creneau.local }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <p v-else class="etat-vide">Aucun cours prévu aujourd'hui.</p>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useEcoleStore } from "@/stores/ecole";
import { aujourdHui } from "@/composables/utiliserDate";

const store = useEcoleStore();
const aujourdHuiIso = aujourdHui();

onMounted(async () => {
  if (store.horaires.length === 0) await store.chargerHoraires();
  if (store.evenements.length === 0) await store.chargerEvenements();
});

const estCongeAujourdhui = computed(() =>
  store.evenements.some(
    (e) => e.type === "conge" && e.dateDebut <= aujourdHuiIso && e.dateFin >= aujourdHuiIso
  )
);

const horaireActuel = computed(() => {
  return (
    store.horaires.find(
      (horaire) => horaire.startDate <= aujourdHuiIso && horaire.endDate >= aujourdHuiIso,
    ) ?? store.horaires[0]
  );
});

const creneauxDuJour = computed(() => {
  if (estCongeAujourdhui.value) return [];

  const d = new Date();
  const nomJour = d.toLocaleDateString("fr-BE", { weekday: "long" });
  const jourFormate = nomJour.charAt(0).toUpperCase() + nomJour.slice(1);

  console.log('=== HoraireDuJour DEBUG ===')
  console.log('Jour formaté:', jourFormate)
  console.log('Slots disponibles:', horaireActuel.value?.slots.map(s => s.day))
  console.log('Horaire actuel:', horaireActuel.value?.nom)

  return (
    horaireActuel.value?.slots
      .filter((creneau) => creneau.day === jourFormate)
      .sort((a, b) => a.period - b.period) ?? []
  );
});
</script>

<style scoped>
</style>
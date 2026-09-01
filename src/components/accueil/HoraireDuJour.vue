<!--
  Widget de la page d'accueil qui affiche les cours prévus aujourd'hui,
  en tenant compte des congés (aucun cours affiché si on est en congé).
-->
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

// Charge les horaires et événements nécessaires s'ils ne sont pas déjà en mémoire.
onMounted(async () => {
  if (store.horaires.length === 0) await store.chargerHoraires();
  if (store.evenements.length === 0) await store.chargerEvenements();
});

// Vrai si aujourd'hui tombe dans une période de congé enregistrée.
const estCongeAujourdhui = computed(() =>
  store.evenements.some(
    (e) => e.type === "conge" && e.dateDebut <= aujourdHuiIso && e.dateFin >= aujourdHuiIso
  )
);

// Trouve l'horaire dont la période de validité (startDate/endDate) couvre
// aujourd'hui ; si aucun ne correspond, on retombe sur le premier horaire
// disponible par défaut.
const horaireActuel = computed(() => {
  return (
    store.horaires.find(
      (horaire) => horaire.startDate <= aujourdHuiIso && horaire.endDate >= aujourdHuiIso,
    ) ?? store.horaires[0]
  );
});

// Liste des créneaux du jour, triés par période. Vide si on est en congé.
const creneauxDuJour = computed(() => {
  if (estCongeAujourdhui.value) return [];

  const d = new Date();
  const nomJour = d.toLocaleDateString("fr-BE", { weekday: "long" });
  // Met une majuscule au nom du jour pour correspondre au format stocké dans les slots.
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

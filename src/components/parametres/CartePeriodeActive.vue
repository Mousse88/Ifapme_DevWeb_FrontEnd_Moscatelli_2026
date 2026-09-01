<!--
  Carte des paramètres "Période active" : 3 gros boutons pour choisir
  quelle période de cotation (1, 2 ou 3) est actuellement active dans
  toute l'application (cahier de cotes, présences...).
-->
<template>
  <v-card class="pa-5 carte-parametre" rounded="xl" :class="estSombre ? 'carte-sombre' : 'carte-claire'">
    <div class="d-flex align-center mb-4 ga-3">
      <v-icon size="28" color="success">mdi-flag-checkered</v-icon>
      <h2 class="text-h6 font-weight-bold">Période active</h2>
    </div>

    <p class="description mb-5">
      Sélectionne la période de cotation en cours. Elle s'applique automatiquement
      au cahier de cotes et aux présences.
    </p>

    <!-- Boutons période -->
    <div class="d-flex ga-3 flex-wrap">
      <button
        v-for="p in 3"
        :key="p"
        :class="['btn-periode', store.periodeActive === p ? 'actif' : 'inactif']"
        @click="store.definirPeriode(p)"
      >
        <div class="numero-periode">P{{ p }}</div>
        <div class="libelle-periode">Période {{ p }}</div>
      </button>
    </div>

    <div class="mt-5">
      <v-chip color="success" variant="tonal">
        <v-icon start>mdi-check-circle</v-icon>
        Période active : <strong class="ml-1">P{{ store.periodeActive }}</strong>
      </v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useParametresStore } from '@/stores/parametres'

const store = useParametresStore()
const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)
</script>

<style scoped>
.btn-periode {
  width: 110px;
  height: 90px;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-periode.inactif {
  background: transparent;
  border-color: #d1d5db;
  color: #9ca3af;
}
.btn-periode.inactif:hover {
  border-color: #10b981;
  color: #065f46;
}

.btn-periode.actif {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.numero-periode {
  font-size: 24px;
  font-weight: 800;
}

.libelle-periode {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;
}
</style>

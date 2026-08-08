<template>
  <div class="conteneur-periodes">
    <button
      v-for="periode in listePeriodes"
      :key="String(periode.valeur)"
      :class="['btn-periode', valeurModele === periode.valeur ? 'actif' : 'inactif', periode.valeur === parametres.periodeActive ? 'periode-active' : '']"
      @click="valeurModele = periode.valeur"
    >
      {{ periode.libelle }}
      <span v-if="periode.valeur === parametres.periodeActive" class="badge-active">active</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useParametresStore } from '@/stores/parametres'

type ValeurPeriode = number | 'annuel'

const valeurModele = defineModel<ValeurPeriode>()
const parametres = useParametresStore()

const listePeriodes: { libelle: string; valeur: ValeurPeriode }[] = [
  { libelle: 'Période 1', valeur: 1 },
  { libelle: 'Période 2', valeur: 2 },
  { libelle: 'Période 3', valeur: 3 },
  { libelle: 'Aperçu annuel', valeur: 'annuel' },
]

// Présélectionner la période active au chargement
onMounted(() => {
  valeurModele.value = parametres.periodeActive
})
</script>

<style scoped>
.conteneur-periodes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn-periode {
  padding: 8px 20px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-periode.inactif {
  background: transparent;
  border-color: #f97316;
  color: #f97316;
}
.btn-periode.inactif:hover {
  background: #fff7ed;
}

.btn-periode.actif {
  background: #f97316;
  border-color: #f97316;
  color: white;
}

.badge-active {
  font-size: 10px;
  font-weight: 700;
  background: rgba(255,255,255,0.3);
  border-radius: 10px;
  padding: 1px 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-periode.inactif .badge-active {
  background: #f97316;
  color: white;
}
</style>
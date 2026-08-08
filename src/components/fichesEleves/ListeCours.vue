<template>
  <section class="mb-10">
    <h2 class="titre-section">📖 Mes cours</h2>

    <div v-if="cours.length === 0" class="etat-vide">
      Aucun cours pour le moment...
    </div>

    <div v-else class="grille">
      <v-card
        v-for="coursItem in cours"
        :key="coursItem.id"
        class="carte carte-cours"
      >
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="titre-carte">{{ coursItem.nom }}</div>

            <v-chip size="small" class="mt-1 pastille">
              {{ nombreClassesParCours(coursItem.id) }} classe(s)
            </v-chip>
          </div>

          <div class="d-flex ga-2">
            <v-btn
              icon
              variant="text"
              class="bouton-modifier"
              @click.stop="$emit('modifier-cours', coursItem)"
            >
              ✏️
            </v-btn>

            <v-btn
              icon
              variant="text"
              class="bouton-supprimer"
              @click.stop="$emit('supprimer-cours', coursItem.id)"
            >
              🗑️
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Cours } from "@/stores/ecole";

defineProps<{
  cours: Cours[];
  nombreClassesParCours: (coursId: number) => number;
}>();

defineEmits<{
  (e: "modifier-cours", cours: Cours): void;
  (e: "supprimer-cours", coursId: number): void;
}>();
</script>

<style scoped>
.carte {
  padding: 18px;
  border-radius: 16px;
}

.titre-carte {
  color: #111827;
}

.carte-cours {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.pastille {
  background: #065f46;
  color: white;
}

.grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

</style>

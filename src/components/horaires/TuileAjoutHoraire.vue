<!--
  Simple carte cliquable en pointillés ("+ Ajouter un horaire") affichée
  dans la grille des horaires, pour ouvrir le formulaire de création.
-->
<template>
  <v-card class="tuile-ajout" @click="$emit('ajouter')">
    <v-icon size="48">mdi-plus</v-icon>
    <div class="texte">Ajouter un horaire</div>
  </v-card>
</template>

<script setup lang="ts">
defineEmits<{
  (e: "ajouter"): void;
}>();
</script>

<style scoped>
.tuile-ajout {
  height: 160px;
  border-radius: 16px;
  border: 2px dashed #10b981;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(16, 185, 129, 0.05);
  transition: 0.2s;
}

.tuile-ajout:hover {
  transform: translateY(-3px);
  background: rgba(16, 185, 129, 0.15);
}

.texte {
  margin-top: 8px;
  font-weight: 600;
  color: #065f46;
}
</style>

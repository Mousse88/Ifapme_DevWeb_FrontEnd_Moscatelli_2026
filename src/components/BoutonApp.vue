<!--
  Bouton générique réutilisé dans toute l'application, avec 4 variantes
  de couleur (primary/secondary/success/echec) et un état "loading"
  qui affiche un spinner à la place de l'icône.
-->
<template>
  <button
    :class="['bouton-app', `bouton-${variante}`, { 'bouton-desactive': disabled }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <!-- Spinner affiché pendant le chargement, sinon icône normale si fournie -->
    <v-icon v-if="loading" class="mr-2" size="18">mdi-loading mdi-spin</v-icon>
    <v-icon v-else-if="icone" class="mr-2" size="18">{{ icone }}</v-icon>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variante?: 'primary' | 'secondary' | 'success' | 'echec'
  icone?: string
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.bouton-app {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.bouton-app:hover:not(.bouton-desactive) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bouton-app:active:not(.bouton-desactive) {
  transform: translateY(0);
}

/* Primary — vert */
.bouton-primary {
  background: #10b981;
  color: white;
}
.bouton-primary:hover:not(.bouton-desactive) {
  background: #059669;
}

/* Secondary — vert foncé */
.bouton-secondary {
  background: #059669;
  color: white;
}
.bouton-secondary:hover:not(.bouton-desactive) {
  background: #047857;
}

/* Success — orange */
.bouton-success {
  background: #f97316;
  color: white;
}
.bouton-success:hover:not(.bouton-desactive) {
  background: #ea580c;
}

/* Echec — rouge */
.bouton-echec {
  background: #ef4444;
  color: white;
}
.bouton-echec:hover:not(.bouton-desactive) {
  background: #dc2626;
}

/* Désactivé */
.bouton-desactive {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>

<template>
  <v-container class="pa-6" :class="estSombre ? 'fond-page-sombre' : 'fond-page-clair'">

    <div class="entete mb-6">
      <div>
        <h1 class="titre">{{ titre }}</h1>
        <p v-if="sousTitre" class="sous-titre">{{ sousTitre }}</p>
      </div>

      <!-- Slot pour les boutons/actions à droite -->
      <div v-if="$slots.actions" class="d-flex ga-3 flex-wrap align-center">
        <slot name="actions" />
      </div>
    </div>

    <!-- Contenu principal -->
    <slot />

  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

defineProps<{
  titre: string
  sousTitre?: string
}>()

const theme = useTheme()
const estSombre = computed(() => theme.global.current.value.dark)
</script>

<style scoped>
.entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titre {
  font-size: 28px;
  font-weight: 800;
  color: #065f46;
}
.fond-page-sombre .titre { color: #f9fafb; }

.sous-titre { color: #6b7280; }
.fond-page-sombre .sous-titre { color: #cbd5e1; }
</style>
<template>
  <PageLayout titre="Connexion">
    <div class="d-flex align-center justify-center login-zone">
      <v-card width="400" class="pa-6">
        <v-card-title class="text-h5">Connexion</v-card-title>

        <v-form @submit.prevent="submit">
          <v-text-field v-model="username" label="Utilisateur" required />
          <v-text-field v-model="password" label="Mot de passe" type="password" required />

          <v-alert v-if="error" type="error" class="mb-4">
            {{ error }}
          </v-alert>

          <BoutonApp variante="primary" :loading="loading" style="width: 100%" @click="submit">
            Se connecter
          </BoutonApp>
        </v-form>
      </v-card>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '@/components/Pagelayout.vue'
import { useAuthStore } from '@/stores/auth'
import BoutonApp from '@/components/BoutonApp.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(username.value, password.value)
    router.push('/')
  } catch {
    error.value = 'Utilisateur ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-zone {
  min-height: 60vh;
}
</style>
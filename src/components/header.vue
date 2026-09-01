<!--
  Barre de navigation principale de l'application : barre du haut
  (titre, utilisateur connecté, bouton mode sombre) + volet latéral
  avec les liens vers toutes les pages. Le comportement s'adapte selon
  qu'on est sur mobile (volet temporaire qui se replie) ou desktop
  (volet permanent, "rétractable" en mode icônes seules).
-->
<template>
  <!-- BARRE DU HAUT -->
  <v-app-bar :elevation="2" :class="['barre-application', estSombre ? 'sombre' : 'clair']">

    <!-- Bouton toggle volet (mobile uniquement) : ouvre/ferme le menu latéral -->
    <v-btn v-if="mobile" icon @click="voletOuvert = !voletOuvert" class="bouton-icone-navigation ml-1">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Titre de l'appli, cliquable pour revenir à l'accueil -->
    <v-app-bar-title class="titre">
      <RouterLink to="/" class="lien-titre">Mousse Academy</RouterLink>
    </v-app-bar-title>

    <v-spacer />

    <!-- Utilisateur + déconnexion (desktop) -->
    <template v-if="authStore.isAuthenticated && !mobile">
      <span class="mr-3 text-sm">{{ authStore.user?.username }}</span>
      <v-btn color="red" variant="tonal" size="small" class="mr-2" @click="deconnexion">
        Déconnexion
      </v-btn>
    </template>

    <!-- Bouton pour basculer entre thème clair et sombre -->
    <v-btn icon @click="basculerTheme" class="bouton-theme ml-1">
      <v-icon size="22">
        {{ estSombre ? "mdi-white-balance-sunny" : "mdi-weather-night" }}
      </v-icon>
    </v-btn>
  </v-app-bar>

  <!-- VOLET LATÉRAL -->
  <v-navigation-drawer
    v-model="voletOuvert"
    :temporary="mobile"
    :permanent="!mobile"
    :rail="!mobile && voletRetracte"
    :class="['volet', estSombre ? 'volet-sombre' : 'volet-clair']"
    width="230"
  >
    <!-- En-tête volet (desktop uniquement avec bouton rétracter) -->
    <div v-if="!mobile" class="volet-entete">
      <v-btn
        icon
        variant="text"
        size="small"
        @click="voletRetracte = !voletRetracte"
        class="bouton-retract"
      >
        <v-icon>{{ voletRetracte ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
    </div>

    <v-divider v-if="!mobile" />

    <!-- Liens navigation : générés depuis le tableau elementsNavigation.
         Sur desktop rétracté, on n'affiche que les icônes avec une infobulle. -->
    <v-list density="compact" nav>
      <v-list-item
        v-for="element in elementsNavigation"
        :key="element.libelle"
        :to="element.vers"
        :prepend-icon="element.icone"
        :title="voletRetracte && !mobile ? '' : element.libelle"
        :class="['lien-nav', estSombre ? 'lien-sombre' : 'lien-clair']"
        rounded="lg"
        @click="mobile ? voletOuvert = false : null"
      >
        <template v-if="voletRetracte && !mobile" #prepend>
          <v-tooltip :text="element.libelle" location="right">
            <template #activator="{ props }">
              <v-icon v-bind="props">{{ element.icone }}</v-icon>
            </template>
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <!-- Déconnexion mobile (sur desktop, le bouton est dans la barre du haut) -->
      <v-list density="compact" nav v-if="mobile && authStore.isAuthenticated">
        <v-list-item
          prepend-icon="mdi-account"
          :title="authStore.user?.username ?? ''"
        />
        <v-list-item
          prepend-icon="mdi-logout"
          title="Déconnexion"
          @click="deconnexion"
        />
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// useDisplay() de Vuetify nous dit si on est sur un écran mobile ou non,
// pour adapter le comportement du volet (temporaire vs permanent).
const { mobile } = useDisplay()
const theme = useTheme()
const router = useRouter()
const authStore = useAuthStore()

const estSombre = computed(() => theme.global.current.value.dark)
// Sur mobile le volet démarre fermé, sur desktop il démarre ouvert.
const voletOuvert = ref(!mobile.value)
// Mode "rail" desktop : le volet est réduit à des icônes seules.
const voletRetracte = ref(false)

// Bascule entre le thème Vuetify "light" et "dark".
function basculerTheme() {
  theme.change(estSombre.value ? 'light' : 'dark')
}

// Déconnecte l'utilisateur (vide le store auth) et le renvoie sur /login.
function deconnexion() {
  authStore.logout()
  router.push('/login')
}

// Liste des liens affichés dans le menu latéral (libellé, route, icône).
const elementsNavigation = [
  { libelle: 'Accueil',           vers: '/',                  icone: 'mdi-home' },
  { libelle: 'Cahier de cotes',   vers: '/cahier-de-cotes',   icone: 'mdi-notebook' },
  { libelle: 'Calendrier Annuel', vers: '/calendrier-annuel', icone: 'mdi-calendar' },
  { libelle: 'Fiches élèves',     vers: '/fiches-eleves',     icone: 'mdi-account-group' },
  { libelle: 'Horaires',          vers: '/horaires',          icone: 'mdi-timetable' },
  { libelle: 'Présences',         vers: '/presences',         icone: 'mdi-clipboard-check' },
  { libelle: 'Semainier',         vers: '/semainier',         icone: 'mdi-view-week' },
  { libelle: 'Mes cours',         vers: '/mes-cours',         icone: 'mdi-book-open-variant' },
  { libelle: 'Paramètres',        vers: '/parametres',        icone: 'mdi-cog' },
]
</script>

<style scoped>
.barre-application { transition: all 0.3s ease; }
.barre-application.clair { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.barre-application.sombre { background: linear-gradient(135deg, #111827, #1f2937); color: #f9fafb; }

.lien-titre { text-decoration: none; color: inherit; font-weight: 800; }

.bouton-icone-navigation { color: white !important; }

.bouton-theme {
  background: rgba(255, 255, 255, 0.18);
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.barre-application.sombre .bouton-theme {
  background: rgba(249, 250, 251, 0.12);
  color: #fbbf24 !important;
  border-color: rgba(251, 191, 36, 0.35);
}

.volet-clair { background: white !important; border-right: 1px solid #d1fae5 !important; }
.volet-sombre { background: #1e293b !important; border-right: 1px solid #334155 !important; }

.volet-entete {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 8px;
  min-height: 40px;
}

.bouton-retract { color: #6b7280; }

.lien-clair { color: #065f46 !important; }
.lien-clair:hover { background: #ecfdf5 !important; }
.lien-sombre { color: #6ee7b7 !important; }
.lien-sombre:hover { background: #243044 !important; }
</style>

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Accueil from '@/pages/index.vue'
import Connexion from '@/pages/login.vue'
import CahierDeCotes from '@/pages/cahierDeCotes.vue'
import CalendrierAnnuel from '@/pages/calendrierAnnuel.vue'
import FichesEleves from '@/pages/fichesEleves.vue'
import Horaires from '@/pages/horaires.vue'
import MesCours from '@/pages/mesCours.vue'
import Semainier from '@/pages/semainier.vue'
import Parametres from '@/pages/parametres.vue'
import Presences from '@/pages/presences.vue'

const routeur = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/login', name: 'connexion', component: Connexion, meta: { public: true } },
    { path: '/', name: 'accueil', component: Accueil },
    { path: '/cahier-de-cotes', name: 'cahier-de-cotes', component: CahierDeCotes },
    { path: '/calendrier-annuel', name: 'calendrier-annuel', component: CalendrierAnnuel },
    { path: '/fiches-eleves', name: 'fiches-eleves', component: FichesEleves },
    { path: '/horaires', name: 'horaires', component: Horaires },
    { path: '/mes-cours', name: 'mes-cours', component: MesCours },
    { path: '/presences', name: 'presences', component: Presences },
    { path: '/semainier', name: 'semainier', component: Semainier },
    { path: '/parametres', name: 'parametres', component: Parametres },
  ],
})

routeur.beforeEach((vers) => {
  const authStore = useAuthStore()
  if (!vers.meta.public && !authStore.isAuthenticated) return '/login'
  if (vers.path === '/login' && authStore.isAuthenticated) return '/'
})

export default routeur
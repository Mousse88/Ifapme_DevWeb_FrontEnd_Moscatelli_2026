import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiGet, apiPost } from '@/services/api'

interface ParametresBackend {
  anneeDebut: number
  periodeActive: number
  anneesCreees: number[]
}

export const useParametresStore = defineStore('parametres', () => {
  const anneeParDefaut = new Date().getMonth() < 7
    ? new Date().getFullYear() - 1
    : new Date().getFullYear()

  const anneesCreees = ref<number[]>([anneeParDefaut])

  // Année scolaire réelle en cours (la dernière créée)
  const anneeDebut = ref<number>(anneeParDefaut)

  // Année consultée (peut être une année passée)
  const anneeConsultee = ref<number>(anneeParDefaut)

  const periodeActive = ref<number>(1)

  // True si on consulte l'année en cours, false si on consulte une année passée
  const estAnneeEnCours = computed(() => anneeConsultee.value === anneeDebut.value)

  const libelleAnneeScolaire = computed(() =>
    `${anneeConsultee.value}-${anneeConsultee.value + 1}`
  )

  const libelleAnneeEnCours = computed(() =>
    `${anneeDebut.value}-${anneeDebut.value + 1}`
  )

  async function chargerParametres() {
    try {
      const donnees = await apiGet<ParametresBackend>('/parametres')
      anneeDebut.value = donnees.anneeDebut
      anneeConsultee.value = donnees.anneeDebut
      periodeActive.value = donnees.periodeActive
      anneesCreees.value = donnees.anneesCreees
    } catch {
      // Pas encore de paramètres en DB, on garde les valeurs par défaut
    }
  }

  async function sauvegarderParametres() {
    try {
      await apiPost('/parametres', {
        anneeDebut: anneeDebut.value,
        periodeActive: periodeActive.value,
        anneesCreees: anneesCreees.value,
      })
    } catch (e) {
      console.error('Erreur sauvegarde paramètres:', e)
    }
  }

  // Change l'année consultée (pas l'année en cours !)
  function consulterAnnee(annee: number) {
    anneeConsultee.value = annee
  }

  async function definirPeriode(periode: number) {
    periodeActive.value = periode
    await sauvegarderParametres()
  }

  // Démarre une nouvelle année scolaire SANS effacer les données
  async function demarrerNouvelleAnnee(annee: number) {
    if (!anneesCreees.value.includes(annee)) {
      anneesCreees.value = [...anneesCreees.value, annee].sort((a, b) => a - b)
    }
    anneeDebut.value = annee
    anneeConsultee.value = annee
    periodeActive.value = 1
    await sauvegarderParametres()
  }

  return {
    anneesCreees,
    anneeDebut,
    anneeConsultee,
    periodeActive,
    estAnneeEnCours,
    libelleAnneeScolaire,
    libelleAnneeEnCours,
    chargerParametres,
    consulterAnnee,
    definirPeriode,
    demarrerNouvelleAnnee,
  }
})
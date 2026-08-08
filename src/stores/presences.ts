import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/services/api'
import { useParametresStore } from '@/stores/parametres'

export type CodeStatut = 'P' | 'A' | 'R' | 'E' | 'X'

export interface PresenceEncodee {
  eleveId: number
  statut: CodeStatut
}

interface PresenceBackend {
  id: number
  eleveId: number
  classeId: number
  coursId: number
  date: string
  periode: number
  periodeCotation: number
  statut: string
  anneeDebut: number
}

export const usePresencesStore = defineStore('presences', () => {
  const presencesMock = ref<Map<string, PresenceEncodee[]>>(new Map())
  const chargement = ref(false)

  function annee(): number {
    return useParametresStore().anneeConsultee
  }

  async function chargerPresences(classeId: number, coursId: number, date: string, periode: number) {
    try {
      const cle = `${classeId}-${coursId}-${date}-${periode}`
      const donnees = await apiGet<PresenceBackend[]>(
        `/presences?classeId=${classeId}&coursId=${coursId}&date=${date}&periode=${periode}&anneeDebut=${annee()}`
      )
      const presences: PresenceEncodee[] = donnees.map(p => ({
        eleveId: p.eleveId,
        statut: p.statut as CodeStatut,
      }))
      presencesMock.value.set(cle, presences)
    } catch (e) {
      console.error('Erreur chargement présences:', e)
    }
  }

  async function enregistrer(cle: string, presences: PresenceEncodee[]) {
    const parametres = useParametresStore()

    const parties = cle.split('-')
    const classeId = Number(parties[0])
    const coursId = Number(parties[1])
    const date = `${parties[2]}-${parties[3]}-${parties[4]}`
    const periode = Number(parties[5])

    chargement.value = true
    try {
      await apiPost('/presences/bulk', {
        classeId,
        coursId,
        date,
        periode,
        periodeCotation: parametres.periodeActive,
        anneeDebut: annee(),
        presences,
      })
      presencesMock.value.set(cle, [...presences])
    } catch (e) {
      console.error('Erreur enregistrement présences:', e)
      throw e
    } finally {
      chargement.value = false
    }
  }

  async function supprimerCreneau(cle: string) {
    const parties = cle.split('-')
    const classeId = Number(parties[0])
    const coursId = Number(parties[1])
    const date = `${parties[2]}-${parties[3]}-${parties[4]}`
    const periode = Number(parties[5])

    try {
      await apiDelete(`/presences/bulk?classeId=${classeId}&coursId=${coursId}&date=${date}&periode=${periode}&anneeDebut=${annee()}`)
      presencesMock.value.delete(cle)
    } catch (e) {
      console.error('Erreur suppression présences:', e)
      throw e
    }
  }

  function obtenirPresences(cle: string): PresenceEncodee[] {
    return presencesMock.value.get(cle) ?? []
  }

  function reinitialiserCache() {
    presencesMock.value = new Map()
  }

  return {
    presencesMock,
    chargement,
    chargerPresences,
    enregistrer,
    supprimerCreneau,
    obtenirPresences,
    reinitialiserCache,
  }
})
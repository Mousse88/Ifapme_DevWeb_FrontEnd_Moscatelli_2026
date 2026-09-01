// Composable regroupant tous les calculs de cotes/moyennes utilisés dans
// le cahier de cotes. Il s'appuie sur le store "ecole" pour retrouver
// les interros et les notes de chaque élève.
import { useEcoleStore } from '@/stores/ecole'

export function utiliserCotes() {
  const store = useEcoleStore()

  // Calcule "points obtenus / points max" pour un élève sur toutes les
  // interros d'un cours/classe/période donnés (ex: "14/20"). Renvoie "-"
  // s'il n'y a aucune interro ou aucun point max défini.
  function calculerTotalPoints(classeId: number, coursId: number, periode: number, eleveId: number) {
    const interros = store.obtenirInterros(classeId, coursId, periode)
    if (interros.length === 0) return '-'
    const obtenu = interros.reduce((s, i) => s + (store.obtenirNote(i.id, eleveId)?.pointsObtenus ?? 0), 0)
    const max = interros.reduce((s, i) => s + i.nombrePoints, 0)
    if (max === 0) return '-'
    return `${obtenu}/${max}`
  }

  // Calcule la moyenne ramenée sur 20 pour une période donnée.
  // Ne prend en compte que les interros où l'élève a effectivement une note
  // encodée (sinon on faussererait la moyenne en comptant des 0 non voulus).
  function calculerMoyenneSur20(classeId: number, coursId: number, periode: number, eleveId: number) {
    const interros = store.obtenirInterros(classeId, coursId, periode)
    if (interros.length === 0) return '-'
    let obtenu = 0, max = 0, aNote = false
    interros.forEach(i => {
      const note = store.obtenirNote(i.id, eleveId)
      if (note?.pointsObtenus !== null && note?.pointsObtenus !== undefined) {
        obtenu += note.pointsObtenus
        max += i.nombrePoints
        aNote = true
      }
    })
    if (!aNote || max === 0) return '-'
    return ((obtenu / max) * 20).toFixed(2)
  }

  // Alias : la moyenne "par période" est simplement la moyenne sur 20
  // calculée pour cette période précise.
  function calculerMoyenneParPeriode(classeId: number, coursId: number, periode: number, eleveId: number) {
    return calculerMoyenneSur20(classeId, coursId, periode, eleveId)
  }

  // Calcule la moyenne annuelle sur 20 en cumulant les points de toutes
  // les périodes (1 à 3) du cours pour un élève donné.
  function calculerMoyenneAnnuelle(classeId: number, coursId: number, eleveId: number) {
    let totalObtenu = 0, totalMax = 0, aNote = false
    for (let p = 1; p <= 3; p++) {
      store.obtenirInterros(classeId, coursId, p).forEach(i => {
        const note = store.obtenirNote(i.id, eleveId)
        if (note?.pointsObtenus !== null && note?.pointsObtenus !== undefined) {
          totalObtenu += note.pointsObtenus
          totalMax += i.nombrePoints
          aNote = true
        }
      })
    }
    if (!aNote || totalMax === 0) return '-'
    return ((totalObtenu / totalMax) * 20).toFixed(2)
  }

  return { calculerTotalPoints, calculerMoyenneSur20, calculerMoyenneParPeriode, calculerMoyenneAnnuelle }
}

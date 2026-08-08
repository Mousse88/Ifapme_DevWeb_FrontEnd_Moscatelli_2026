import { useEcoleStore } from '@/stores/ecole'

export function utiliserCotes() {
  const store = useEcoleStore()

  function calculerTotalPoints(classeId: number, coursId: number, periode: number, eleveId: number) {
    const interros = store.obtenirInterros(classeId, coursId, periode)
    if (interros.length === 0) return '-'
    const obtenu = interros.reduce((s, i) => s + (store.obtenirNote(i.id, eleveId)?.pointsObtenus ?? 0), 0)
    const max = interros.reduce((s, i) => s + i.nombrePoints, 0)
    if (max === 0) return '-'
    return `${obtenu}/${max}`
  }

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

  function calculerMoyenneParPeriode(classeId: number, coursId: number, periode: number, eleveId: number) {
    return calculerMoyenneSur20(classeId, coursId, periode, eleveId)
  }

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
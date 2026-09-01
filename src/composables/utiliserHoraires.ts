// Référentiel des heures de début/fin pour chaque période de cours (1 à 8)
// dans une journée type. Sert à afficher les horaires des cours en heures
// réelles plutôt qu'en simples numéros de période.
export const PERIODES_HEURES: Record<number, { debut: string; fin: string }> = {
  1: { debut: '08:30', fin: '09:20' },
  2: { debut: '09:20', fin: '10:10' },
  3: { debut: '10:10', fin: '11:00' },
  4: { debut: '11:15', fin: '12:05' },
  5: { debut: '12:05', fin: '12:55' },
  6: { debut: '13:45', fin: '14:35' },
  7: { debut: '14:35', fin: '15:25' },
  8: { debut: '15:25', fin: '16:15' },
}

// Renvoie une chaîne "HH:MM - HH:MM" pour une période donnée, ou chaîne vide
// si la période est nulle/inconnue.
export function heuresPeriode(periode: number | null): string {
  if (!periode) return ''
  const h = PERIODES_HEURES[periode]
  return h ? `${h.debut} - ${h.fin}` : ''
}

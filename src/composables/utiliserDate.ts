// Petites fonctions utilitaires de formatage de dates, réutilisées
// dans toute l'application pour garder un format cohérent (YYYY-MM-DD
// pour les échanges avec l'API, JJ/MM/AAAA pour l'affichage).

// Renvoie la date du jour au format ISO simplifié "YYYY-MM-DD".
export function aujourdHui(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Convertit un objet Date JS en chaîne "YYYY-MM-DD" (même format que aujourdHui).
export function convertirDateIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Convertit une date "YYYY-MM-DD" en format lisible "JJ/MM/AAAA" pour l'affichage.
export function formaterDate(date: string): string {
  if (!date) return ''
  const [annee, mois, jour] = date.split('-')
  return `${jour}/${mois}/${annee}`
}

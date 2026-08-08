import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api'
import { useParametresStore } from '@/stores/parametres'

export interface Cours {
  id: number
  nom: string
  anneeDebut: number
}

export interface Classe {
  id: number
  nom: string
  coursIds: number[]
  anneeDebut: number
}

export interface Eleve {
  id: number
  classeId: number
  nom: string
  prenom: string
  dateNaissance: string
  anneeDebut: number
}

export interface CreneauHoraire {
  day: string
  period: number
  classe: string
  cours: string
  local: string
}

export interface Horaire {
  id: number
  nom: string
  startDate: string
  endDate: string
  slots: CreneauHoraire[]
  anneeDebut: number
}

export interface Interro {
  id: number
  classeId: number
  coursId: number
  periode: number
  titre: string
  nombrePoints: number
  anneeDebut: number
}

export interface Note {
  interroId: number
  eleveId: number
  pointsObtenus: number | null
}

export interface NoteSemainier {
  id: number
  horaireId: number
  date: string
  day: string
  period: number
  contenu: string
  anneeDebut: number
}

export interface EvenementCalendrier {
  id: number
  titre: string
  type: string
  jourEntier: boolean
  dateDebut: string
  dateFin: string
  heureDebut: string | null
  heureFin: string | null
  emplacement: string | null
  description: string | null
  couleur: string | null
  anneeDebut: number
}

export const useEcoleStore = defineStore('ecole', () => {
  const cours = ref<Cours[]>([])
  const classes = ref<Classe[]>([])
  const eleves = ref<Eleve[]>([])
  const horaires = ref<Horaire[]>([])
  const interros = ref<Interro[]>([])
  const notes = ref<Note[]>([])
  const notesSemainier = ref<NoteSemainier[]>([])
  const evenements = ref<EvenementCalendrier[]>([])
  const classesOuvertes = ref<Set<number>>(new Set())

  // Helper : récupère l'année consultée depuis le store paramètres
  function annee(): number {
    return useParametresStore().anneeConsultee
  }

  function classeOuverte(id: number): boolean {
    return classesOuvertes.value.has(id)
  }

  function toggleClasse(id: number) {
    if (classesOuvertes.value.has(id)) classesOuvertes.value.delete(id)
    else classesOuvertes.value.add(id)
    classesOuvertes.value = new Set(classesOuvertes.value)
  }

  function ouvrirClasse(id: number) {
    classesOuvertes.value.add(id)
    classesOuvertes.value = new Set(classesOuvertes.value)
  }

  // ── COURS ────────────────────────────────────
  async function chargerCours() {
    cours.value = await apiGet<Cours[]>(`/cours?anneeDebut=${annee()}`)
  }

  async function ajouterCours(nom: string) {
    if (!nom.trim()) return
    const nouveauCours = await apiPost<Cours>('/cours', { nom: nom.trim(), anneeDebut: annee() })
    cours.value = [...cours.value, nouveauCours]
  }

  async function modifierCours(id: number, nom: string) {
    if (!nom.trim()) return
    const coursModifie = await apiPut<Cours>(`/cours/${id}`, { nom: nom.trim() })
    cours.value = cours.value.map(c => c.id === id ? coursModifie : c)
  }

  async function supprimerCours(id: number) {
    await apiDelete(`/cours/${id}`)
    cours.value = cours.value.filter(c => c.id !== id)
    classes.value.forEach(classe => {
      classe.coursIds = classe.coursIds.filter(cId => cId !== id)
    })
    interros.value = interros.value.filter(i => i.coursId !== id)
  }

  function obtenirCoursParIds(ids: number[]) {
    return cours.value.filter(c => ids.includes(c.id))
  }

  function obtenirCoursTries() {
    return [...cours.value].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  }

  // ── CLASSES ──────────────────────────────────
  async function chargerClasses() {
    classes.value = await apiGet<Classe[]>(`/classes?anneeDebut=${annee()}`)
  }

  async function ajouterClasse(nom: string, coursIds: number[]) {
    if (!nom.trim() || coursIds.length === 0) return
    const nouvelleClasse = await apiPost<Classe>('/classes', { nom: nom.trim(), coursIds, anneeDebut: annee() })
    classes.value = [...classes.value, nouvelleClasse]
  }

  async function modifierClasse(id: number, nom: string, coursIds: number[]) {
    if (!nom.trim() || coursIds.length === 0) return
    const classeModifiee = await apiPut<Classe>(`/classes/${id}`, { nom: nom.trim(), coursIds })
    classes.value = classes.value.map(c => c.id === id ? classeModifiee : c)
  }

  async function supprimerClasse(id: number) {
    await apiDelete(`/classes/${id}`)
    classes.value = classes.value.filter(c => c.id !== id)
    eleves.value = eleves.value.filter(e => e.classeId !== id)
    interros.value = interros.value.filter(i => i.classeId !== id)
    classesOuvertes.value.delete(id)
    classesOuvertes.value = new Set(classesOuvertes.value)
  }

  function obtenirClasses() {
    return classes.value
  }

  function obtenirClassesTries() {
    return [...classes.value].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  }

  // ── ÉLÈVES ───────────────────────────────────
  async function chargerEleves() {
    eleves.value = await apiGet<Eleve[]>(`/eleves?anneeDebut=${annee()}`)
  }

  async function ajouterEleve(classeId: number, nom: string, prenom: string, dateNaissance: string) {
    if (!classeId || !nom.trim() || !prenom.trim()) return
    const nouvelEleve = await apiPost<Eleve>('/eleves', { classeId, nom: nom.trim(), prenom: prenom.trim(), dateNaissance, anneeDebut: annee() })
    eleves.value = [...eleves.value, nouvelEleve]
    ouvrirClasse(classeId)
  }

  async function modifierEleve(id: number, classeId: number, nom: string, prenom: string, dateNaissance: string) {
    if (!classeId || !nom.trim() || !prenom.trim()) return
    const eleveModifie = await apiPut<Eleve>(`/eleves/${id}`, { classeId, nom: nom.trim(), prenom: prenom.trim(), dateNaissance })
    eleves.value = eleves.value.map(e => e.id === id ? eleveModifie : e)
  }

  async function supprimerEleve(id: number) {
    await apiDelete(`/eleves/${id}`)
    eleves.value = eleves.value.filter(e => e.id !== id)
    notes.value = notes.value.filter(n => n.eleveId !== id)
  }

  function obtenirElevesParClasse(classeId: number) {
    return eleves.value
      .filter(e => e.classeId === classeId)
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'))
  }

  // ── HORAIRES ─────────────────────────────────
  async function chargerHoraires() {
    horaires.value = await apiGet<Horaire[]>(`/horaires?anneeDebut=${annee()}`)
  }

  async function ajouterHoraire(horaire: Omit<Horaire, 'id'>) {
    const nouvelHoraire = await apiPost<Horaire>('/horaires', { ...horaire, anneeDebut: annee() })
    horaires.value = [...horaires.value, nouvelHoraire]
  }

  async function modifierHoraire(id: number, donnees: Horaire) {
    const horaireModifie = await apiPut<Horaire>(`/horaires/${id}`, donnees)
    horaires.value = horaires.value.map(h => h.id === id ? horaireModifie : h)
  }

  async function supprimerHoraire(id: number) {
    await apiDelete(`/horaires/${id}`)
    await apiDelete(`/semainier-notes/horaire/${id}`).catch(() => null)
    horaires.value = horaires.value.filter(h => h.id !== id)
    notesSemainier.value = notesSemainier.value.filter(n => n.horaireId !== id)
  }

  // ── INTERROS ─────────────────────────────────
  async function chargerInterros() {
    interros.value = await apiGet<Interro[]>(`/interros?anneeDebut=${annee()}`)
  }

  async function ajouterInterro(classeId: number, coursId: number, periode: number, titre: string, nombrePoints: number) {
    if (!classeId || !coursId || !titre.trim() || !nombrePoints) return
    const nouvelleInterro = await apiPost<Interro>('/interros', { classeId, coursId, periode, titre: titre.trim(), nombrePoints, anneeDebut: annee() })
    interros.value = [...interros.value, nouvelleInterro]
  }

  async function supprimerInterro(id: number) {
    await apiDelete(`/interros/${id}`)
    interros.value = interros.value.filter(i => i.id !== id)
    notes.value = notes.value.filter(n => n.interroId !== id)
  }

  function obtenirInterros(classeId: number, coursId: number, periode: number) {
    return interros.value.filter(i => i.classeId === classeId && i.coursId === coursId && i.periode === periode)
  }

  // ── NOTES ────────────────────────────────────
  async function chargerNotes() {
    notes.value = await apiGet<Note[]>(`/notes?anneeDebut=${annee()}`)
  }

  function obtenirNote(interroId: number, eleveId: number) {
    return notes.value.find(n => n.interroId === interroId && n.eleveId === eleveId)
  }

  async function modifierNote(interroId: number, eleveId: number, points: number | null) {
    const noteModifiee = await apiPut<Note>('/notes', { interroId, eleveId, pointsObtenus: points })
    const index = notes.value.findIndex(n => n.interroId === interroId && n.eleveId === eleveId)
    if (index !== -1) notes.value[index] = noteModifiee
    else notes.value = [...notes.value, noteModifiee]
  }

  // ── NOTES SEMAINIER ──────────────────────────
  async function chargerNotesSemainier() {
    notesSemainier.value = await apiGet<NoteSemainier[]>(`/semainier-notes?anneeDebut=${annee()}`)
  }

  function obtenirNoteSemainier(horaireId: number, date: string, day: string, period: number) {
    return notesSemainier.value.find(n => n.horaireId === horaireId && n.date === date && n.day === day && n.period === period)
  }

  async function modifierNoteSemainier(donnees: Omit<NoteSemainier, 'id'>) {
    const noteModifiee = await apiPut<NoteSemainier>('/semainier-notes', { ...donnees, anneeDebut: annee() })
    const index = notesSemainier.value.findIndex(n => n.id === noteModifiee.id)
    if (index !== -1) notesSemainier.value[index] = noteModifiee
    else notesSemainier.value = [...notesSemainier.value, noteModifiee]
  }

  async function supprimerNoteSemainier(id: number) {
    await apiDelete(`/semainier-notes/${id}`)
    notesSemainier.value = notesSemainier.value.filter(n => n.id !== id)
  }

  // ── ÉVÉNEMENTS ───────────────────────────────
  async function chargerEvenements() {
    evenements.value = await apiGet<EvenementCalendrier[]>(`/evenements?anneeDebut=${annee()}`)
  }

  async function ajouterEvenement(donnees: Omit<EvenementCalendrier, 'id'>) {
    const nouvelEvenement = await apiPost<EvenementCalendrier>('/evenements', { ...donnees, anneeDebut: annee() })
    evenements.value = [...evenements.value, nouvelEvenement]
  }

  async function modifierEvenement(id: number, donnees: Omit<EvenementCalendrier, 'id'>) {
    const evenementModifie = await apiPut<EvenementCalendrier>(`/evenements/${id}`, donnees)
    evenements.value = evenements.value.map(e => e.id === id ? evenementModifie : e)
  }

  async function supprimerEvenement(id: number) {
    await apiDelete(`/evenements/${id}`)
    evenements.value = evenements.value.filter(e => e.id !== id)
  }

  // ── RECHARGEMENT GLOBAL ──────────────────────
  // À appeler quand on change d'année consultée
  async function rechargerTout() {
    await Promise.all([
      chargerCours(),
      chargerClasses(),
      chargerEleves(),
      chargerHoraires(),
      chargerInterros(),
      chargerNotes(),
      chargerNotesSemainier(),
      chargerEvenements(),
    ])
  }

  return {
    cours, classes, eleves, horaires, interros, notes, notesSemainier, evenements,
    classesOuvertes, classeOuverte, toggleClasse, ouvrirClasse,
    chargerCours, ajouterCours, modifierCours, supprimerCours, obtenirCoursParIds, obtenirCoursTries,
    chargerClasses, ajouterClasse, modifierClasse, supprimerClasse, obtenirClasses, obtenirClassesTries,
    chargerEleves, ajouterEleve, modifierEleve, supprimerEleve, obtenirElevesParClasse,
    chargerHoraires, ajouterHoraire, modifierHoraire, supprimerHoraire,
    chargerInterros, ajouterInterro, supprimerInterro, obtenirInterros,
    chargerNotes, obtenirNote, modifierNote,
    chargerNotesSemainier, obtenirNoteSemainier, modifierNoteSemainier, supprimerNoteSemainier,
    chargerEvenements, ajouterEvenement, modifierEvenement, supprimerEvenement,
    rechargerTout,
  }
})
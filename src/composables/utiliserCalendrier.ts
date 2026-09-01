// Composable qui construit la structure de données d'un mois de calendrier
// (semaines + jours, avec les jours "hors mois" pour compléter la grille),
// et fournit des helpers pour retrouver/afficher les événements d'une date.
import { unref, type MaybeRef } from "vue";
import type { EvenementCalendrier } from "@/stores/ecole";
import { convertirDateIso } from "@/composables/utiliserDate";

// Une case du calendrier : un jour, avec son numéro, sa date ISO, et si
// elle appartient au mois affiché ou à un mois voisin (pour compléter la grille).
export type CelluleCalendrier = {
  jour: number;
  moisActuel: boolean;
  date: string;
};

// Une ligne de la grille = une semaine de 7 jours.
export type SemaineCalendrier = {
  estSemaineCours: boolean;
  jours: CelluleCalendrier[];
  premierJour: Date;
};

// Un mois complet = son nom + la liste de ses semaines.
export type MoisCalendrier = {
  nom: string;
  semaines: SemaineCalendrier[];
};

const nomsMois: Record<number, string> = {
  1: "Janvier",
  2: "Février",
  3: "Mars",
  4: "Avril",
  5: "Mai",
  6: "Juin",
  7: "Juillet",
  8: "Août",
  9: "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Décembre",
};

// "evenements" est passé en paramètre (souvent le tableau réactif du store)
// pour que les fonctions du composable travaillent toujours sur les données à jour.
export function utiliserCalendrier(
  evenements: MaybeRef<EvenementCalendrier[]>,
) {
  const nomsJours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Renvoie tous les événements qui couvrent une date donnée
  // (la date est comprise entre dateDebut et dateFin de l'événement).
  function obtenirEvenementsPourDate(date: string) {
    return unref(evenements).filter((evenement) => {
      return date >= evenement.dateDebut && date <= evenement.dateFin;
    });
  }

  // Construit le texte affiché dans l'infobulle d'un événement :
  // titre + horaire (ou "Journée entière") + lieu si renseigné.
  function titreEvenement(evenement: EvenementCalendrier) {
    const heure = evenement.jourEntier
      ? "Journée entière"
      : `${evenement.heureDebut ?? ""} - ${evenement.heureFin ?? ""}`;

    const lieu = evenement.emplacement ? ` | ${evenement.emplacement}` : "";

    return `${evenement.titre} | ${heure}${lieu}`;
  }

  // Construit toute la grille d'un mois donné (mois 1-12, année complète),
  // en remplissant les jours avant/après le mois pour obtenir des semaines
  // complètes de 7 jours (comme un calendrier classique).
  // -1 car JS démarre les mois à 0 et moi à 1
  function construireMois(mois: number, annee: number): MoisCalendrier {
    const premierJour = new Date(annee, mois - 1, 1);
    // Jour 0 du mois suivant
    const dernierJour = new Date(annee, mois, 0);

    // getDay() renvoie 0 pour dimanche ; on décale pour que la semaine
    // commence un lundi (décalage = nombre de jours à compléter avant le 1er).
    const decalageDebut = (premierJour.getDay() + 6) % 7;

    // Semaines: tableau de semaines complètes
    // Semaine: semaine en cours
    // debutSemaineActuelle: lundi de la semaine en cours
    const semaines: SemaineCalendrier[] = [];
    let semaine: CelluleCalendrier[] = [];
    let debutSemaineActuelle: Date | null = null;

    const joursMoisPrecedent = new Date(annee, mois - 1, 0).getDate();

    // 1) Complète le début de la première semaine avec les derniers jours
    // du mois précédent (affichés en grisé côté template via moisActuel: false).
    for (let i = 0; i < decalageDebut; i++) {
      const date = new Date(
        annee,
        //Moins 2 car on veut le mois précédent, JS commence à 0 et moi à 1
        mois - 2,
        joursMoisPrecedent - decalageDebut + i + 1,
      );

      semaine.push({
        jour: date.getDate(),
        moisActuel: false,
        date: convertirDateIso(date),
      });
    }

    // 2) Ajoute tous les jours du mois courant, en démarrant une nouvelle
    // semaine (ligne) dès que la précédente atteint 7 jours.
    for (let jour = 1; jour <= dernierJour.getDate(); jour++) {
      const date = new Date(annee, mois - 1, jour);

      if (semaine.length === 0) debutSemaineActuelle = date;

      semaine.push({
        jour,
        moisActuel: true,
        date: convertirDateIso(date),
      });

      if (semaine.length === 7) {
        semaines.push({
          estSemaineCours: true,
          jours: semaine,
          premierJour: debutSemaineActuelle!,
        });

        semaine = [];
      }
    }

    // 3) Complète la dernière semaine avec les premiers jours du mois suivant,
    // si elle n'est pas déjà pleine.
    if (semaine.length > 0) {
      let jourSuivant = 1;

      while (semaine.length < 7) {
        const date = new Date(annee, mois, jourSuivant);

        semaine.push({
          jour: date.getDate(),
          moisActuel: false,
          date: convertirDateIso(date),
        });

        jourSuivant++;
      }

      semaines.push({
        estSemaineCours: true,
        jours: semaine,
        premierJour: debutSemaineActuelle!,
      });
    }

    return {
      nom: nomsMois[mois],
      semaines,
    };
  }

  // Raccourci pour construire directement la grille du mois en cours (aujourd'hui).
  function construireMoisCourant() {
    const aujourdhui = new Date();
    return construireMois(aujourdhui.getMonth() + 1, aujourdhui.getFullYear());
  }

  return {
    nomsJours,
    construireMois,
    construireMoisCourant,
    obtenirEvenementsPourDate,
    titreEvenement,
  };
}

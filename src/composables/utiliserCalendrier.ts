import { unref, type MaybeRef } from "vue";
import type { EvenementCalendrier } from "@/stores/ecole";
import { convertirDateIso } from "@/composables/utiliserDate";

export type CelluleCalendrier = {
  jour: number;
  moisActuel: boolean;
  date: string;
};

export type SemaineCalendrier = {
  estSemaineCours: boolean;
  jours: CelluleCalendrier[];
  premierJour: Date;
};

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

export function utiliserCalendrier(
  evenements: MaybeRef<EvenementCalendrier[]>,
) {
  const nomsJours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  function obtenirEvenementsPourDate(date: string) {
    return unref(evenements).filter((evenement) => {
      return date >= evenement.dateDebut && date <= evenement.dateFin;
    });
  }

  function titreEvenement(evenement: EvenementCalendrier) {
    const heure = evenement.jourEntier
      ? "Journée entière"
      : `${evenement.heureDebut ?? ""} - ${evenement.heureFin ?? ""}`;

    const lieu = evenement.emplacement ? ` | ${evenement.emplacement}` : "";

    return `${evenement.titre} | ${heure}${lieu}`;
  }

  function construireMois(mois: number, annee: number): MoisCalendrier {
    const premierJour = new Date(annee, mois - 1, 1);
    const dernierJour = new Date(annee, mois, 0);

    const decalageDebut = (premierJour.getDay() + 6) % 7;

    const semaines: SemaineCalendrier[] = [];
    let semaine: CelluleCalendrier[] = [];
    let debutSemaineActuelle: Date | null = null;

    const joursMoisPrecedent = new Date(annee, mois - 1, 0).getDate();

    for (let i = 0; i < decalageDebut; i++) {
      const date = new Date(
        annee,
        mois - 2,
        joursMoisPrecedent - decalageDebut + i + 1,
      );

      semaine.push({
        jour: date.getDate(),
        moisActuel: false,
        date: convertirDateIso(date),
      });
    }

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
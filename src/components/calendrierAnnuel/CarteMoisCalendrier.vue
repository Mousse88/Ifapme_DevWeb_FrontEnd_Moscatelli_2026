<template>
  <v-col cols="12" :md="compact ? 6 : 4" class="mb-4">
    <div class="carte-mois" :class="{ compacte: compact }">
      <div class="entete-mois">
        {{ mois.nom }}
      </div>

      <table class="tableau-mois">
        <thead>
          <tr>
            <th v-if="!compact" class="colonne-semaine"></th>

            <th
              v-for="jour in nomsJours"
              :key="jour"
              :class="{ weekend: jour === 'Sam' || jour === 'Dim' }"
            >
              {{ compact ? jour.slice(0, 2) : jour }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(semaine, indexSemaine) in mois.semaines"
            :key="indexSemaine"
          >
            <td v-if="!compact" class="marqueur-semaine">
              <span
                v-if="semaine.estSemaineCours"
                class="clic-semaine"
                @click="$emit('aller-semaine', semaine.premierJour)"
              >
                ✔
              </span>
            </td>

            <td
              v-for="(cellule, indexJour) in semaine.jours"
              :key="indexJour"
              :class="[
                'cellule-jour',
                { weekend: indexJour >= 5 },
                { 'autre-mois': cellule && !cellule.moisActuel },
                {
                  'avec-evenement':
                    cellule && evenementsPourDate(cellule.date).length > 0,
                },
                { 'aujourd-hui': cellule && cellule.date === dateAujourdhui },
              ]"
            >
              <div v-if="cellule" class="contenu-jour">
                <div class="numero-jour">
                  {{
                    compact
                      ? cellule.jour
                      : String(cellule.jour).padStart(2, "0")
                  }}
                </div>

                <div v-if="!compact" class="liste-evenements">
                  <div
                    v-for="evenement in evenementsPourDate(cellule.date)"
                    :key="evenement.id"
                    class="pastille-evenement"
                    :style="{ backgroundColor: evenement.couleur || '#10b981' }"
                    @click.stop="$emit('modifier-evenement', evenement)"
                  >
                    <span class="texte-evenement">
                      {{ evenement.titre }}
                    </span>

                    <div class="infobulle-evenement">
                      {{ titreEvenement(evenement) }}
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="evenementsPourDate(cellule.date).length > 0"
                  class="point-evenement"
                  :style="{ backgroundColor: evenementsPourDate(cellule.date)[0].couleur || '#10b981' }"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import type { EvenementCalendrier } from "@/stores/ecole";
import type { MoisCalendrier } from "@/composables/utiliserCalendrier";
import { aujourdHui } from "@/composables/utiliserDate";

withDefaults(
  defineProps<{
    mois: MoisCalendrier;
    nomsJours: string[];
    evenementsPourDate: (date: string) => EvenementCalendrier[];
    titreEvenement: (evenement: EvenementCalendrier) => string;
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const dateAujourdhui = aujourdHui();

defineEmits<{
  (e: "aller-semaine", date: Date): void;
  (e: "modifier-evenement", evenement: EvenementCalendrier): void;
}>();
</script>

<style scoped>
.carte-mois {
  border-radius: 16px;
  overflow: visible;
  background: white !important;
  color: #111827 !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transition: 0.2s;
}

.entete-mois {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white !important;
  text-align: center;
  padding: 10px;
  font-weight: bold;
}

.tableau-mois {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background: white !important;
  color: #111827 !important;
}

.tableau-mois th {
  background: #d1fae5;
  color: #111827 !important;
  padding: 6px;
  font-size: 0.75rem;
  text-align: center;
}

.tableau-mois th.weekend {
  background: #f97316;
  color: white !important;
}

.colonne-semaine { width: 24px; }

.marqueur-semaine {
  text-align: center;
  background: #ecfdf5;
  color: #111827 !important;
  font-size: 0.75rem;
}

.cellule-jour {
  text-align: center;
  padding: 4px;
  background: white !important;
  color: #111827 !important;
  height: 54px;
  max-height: 54px;
  vertical-align: top;
  position: relative;
  overflow: visible;
  z-index: 1;
}

.cellule-jour.weekend { background: #fed7aa !important; color: #111827 !important; }
.cellule-jour.autre-mois { opacity: 0.4; }
.cellule-jour.aujourd-hui {
  background: #10b981 !important;
  color: white !important;
  border-radius: 8px;
  font-weight: bold;
}

.cellule-jour:hover {
  z-index: 100;
}
.cellule-jour.avec-evenement { box-shadow: inset 0 0 0 2px #10b981; }

.contenu-jour { position: relative; height: 100%; min-width: 0; }
.numero-jour { font-size: 0.75rem; font-weight: 700; color: #111827 !important; }

.liste-evenements {
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 24px;
  overflow: visible;
}

.pastille-evenement {
  position: relative;
  font-size: 0.58rem;
  line-height: 1;
  padding: 2px 3px;
  border-radius: 6px;
  color: white !important;
  cursor: pointer;
  min-width: 0;
  max-width: 100%;
}

.texte-evenement {
  display: block;
  color: white !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.infobulle-evenement {
  display: none;
  position: absolute;
  z-index: 100;
  left: 50%;
  bottom: 125%;
  transform: translateX(-50%);
  min-width: 170px;
  max-width: 260px;
  background: #111827;
  color: white !important;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.2;
  white-space: normal;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
  pointer-events: none;
}

.pastille-evenement:hover { filter: brightness(0.9); }
.pastille-evenement:hover .infobulle-evenement { display: block; }

.point-evenement {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
}

.clic-semaine { cursor: pointer; color: #111827 !important; }
.clic-semaine:hover { transform: scale(1.1); }

.compacte .cellule-jour { height: 42px; max-height: 42px; }
.compacte .entete-mois { font-size: 0.95rem; }
</style>
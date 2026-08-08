-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Classe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025
);
INSERT INTO "new_Classe" ("id", "nom") SELECT "id", "nom" FROM "Classe";
DROP TABLE "Classe";
ALTER TABLE "new_Classe" RENAME TO "Classe";
CREATE TABLE "new_Cours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025
);
INSERT INTO "new_Cours" ("id", "nom") SELECT "id", "nom" FROM "Cours";
DROP TABLE "Cours";
ALTER TABLE "new_Cours" RENAME TO "Cours";
CREATE TABLE "new_Eleve" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classeId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TEXT NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025,
    CONSTRAINT "Eleve_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Eleve" ("classeId", "dateNaissance", "id", "nom", "prenom") SELECT "classeId", "dateNaissance", "id", "nom", "prenom" FROM "Eleve";
DROP TABLE "Eleve";
ALTER TABLE "new_Eleve" RENAME TO "Eleve";
CREATE TABLE "new_EvenementCalendrier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "jourEntier" BOOLEAN NOT NULL DEFAULT false,
    "dateDebut" TEXT NOT NULL,
    "dateFin" TEXT NOT NULL,
    "heureDebut" TEXT,
    "heureFin" TEXT,
    "emplacement" TEXT,
    "description" TEXT,
    "couleur" TEXT DEFAULT '#10b981',
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025
);
INSERT INTO "new_EvenementCalendrier" ("couleur", "dateDebut", "dateFin", "description", "emplacement", "heureDebut", "heureFin", "id", "jourEntier", "titre", "type") SELECT "couleur", "dateDebut", "dateFin", "description", "emplacement", "heureDebut", "heureFin", "id", "jourEntier", "titre", "type" FROM "EvenementCalendrier";
DROP TABLE "EvenementCalendrier";
ALTER TABLE "new_EvenementCalendrier" RENAME TO "EvenementCalendrier";
CREATE TABLE "new_Horaire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025
);
INSERT INTO "new_Horaire" ("endDate", "id", "nom", "slots", "startDate") SELECT "endDate", "id", "nom", "slots", "startDate" FROM "Horaire";
DROP TABLE "Horaire";
ALTER TABLE "new_Horaire" RENAME TO "Horaire";
CREATE TABLE "new_Interro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classeId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,
    "periode" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "nombrePoints" INTEGER NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025,
    CONSTRAINT "Interro_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interro_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interro" ("classeId", "coursId", "id", "nombrePoints", "periode", "titre") SELECT "classeId", "coursId", "id", "nombrePoints", "periode", "titre" FROM "Interro";
DROP TABLE "Interro";
ALTER TABLE "new_Interro" RENAME TO "Interro";
CREATE TABLE "new_NoteSemainier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horaireId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NoteSemainier" ("contenu", "createdAt", "date", "day", "horaireId", "id", "period", "updatedAt") SELECT "contenu", "createdAt", "date", "day", "horaireId", "id", "period", "updatedAt" FROM "NoteSemainier";
DROP TABLE "NoteSemainier";
ALTER TABLE "new_NoteSemainier" RENAME TO "NoteSemainier";
CREATE TABLE "new_Presence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eleveId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "periodeCotation" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    "anneeDebut" INTEGER NOT NULL DEFAULT 2025,
    CONSTRAINT "Presence_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presence_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presence_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Presence" ("classeId", "coursId", "date", "eleveId", "id", "periode", "periodeCotation", "statut") SELECT "classeId", "coursId", "date", "eleveId", "id", "periode", "periodeCotation", "statut" FROM "Presence";
DROP TABLE "Presence";
ALTER TABLE "new_Presence" RENAME TO "Presence";
CREATE UNIQUE INDEX "Presence_eleveId_classeId_coursId_date_periode_anneeDebut_key" ON "Presence"("eleveId", "classeId", "coursId", "date", "periode", "anneeDebut");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

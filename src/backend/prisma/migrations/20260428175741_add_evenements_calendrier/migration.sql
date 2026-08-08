-- CreateTable
CREATE TABLE "EvenementCalendrier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "jourEntier" BOOLEAN NOT NULL DEFAULT false,
    "dateDebut" TEXT NOT NULL,
    "dateFin" TEXT NOT NULL,
    "heureDebut" TEXT,
    "heureFin" TEXT,
    "emplacement" TEXT,
    "description" TEXT
);

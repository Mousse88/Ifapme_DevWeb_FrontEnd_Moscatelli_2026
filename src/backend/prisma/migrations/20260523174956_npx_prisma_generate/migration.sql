-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Presence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eleveId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "periodeCotation" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    CONSTRAINT "Presence_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presence_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presence_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Presence" ("classeId", "coursId", "date", "eleveId", "id", "periode", "periodeCotation", "statut") SELECT "classeId", "coursId", "date", "eleveId", "id", "periode", "periodeCotation", "statut" FROM "Presence";
DROP TABLE "Presence";
ALTER TABLE "new_Presence" RENAME TO "Presence";
CREATE UNIQUE INDEX "Presence_eleveId_classeId_coursId_date_periode_key" ON "Presence"("eleveId", "classeId", "coursId", "date", "periode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

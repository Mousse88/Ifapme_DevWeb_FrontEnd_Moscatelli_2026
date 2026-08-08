-- CreateTable
CREATE TABLE "Presence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eleveId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    CONSTRAINT "Presence_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presence_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Presence_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Presence_eleveId_classeId_coursId_date_periode_key" ON "Presence"("eleveId", "classeId", "coursId", "date", "periode");

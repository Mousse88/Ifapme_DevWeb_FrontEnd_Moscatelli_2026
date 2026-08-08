-- CreateTable
CREATE TABLE "NoteSemainier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horaireId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

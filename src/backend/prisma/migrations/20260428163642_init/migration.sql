-- CreateTable
CREATE TABLE "Cours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Classe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ClasseCours" (
    "classeId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,

    PRIMARY KEY ("classeId", "coursId"),
    CONSTRAINT "ClasseCours_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClasseCours_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Eleve" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classeId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TEXT NOT NULL,
    CONSTRAINT "Eleve_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classeId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,
    "periode" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "nombrePoints" INTEGER NOT NULL,
    CONSTRAINT "Interro_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interro_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "interroId" INTEGER NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "pointsObtenus" REAL,

    PRIMARY KEY ("interroId", "eleveId"),
    CONSTRAINT "Note_interroId_fkey" FOREIGN KEY ("interroId") REFERENCES "Interro" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Note_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

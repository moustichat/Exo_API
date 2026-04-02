-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duree" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "prix_billet" INTEGER NOT NULL,
    "nombre_total_places" INTEGER NOT NULL,
    "categorie" TEXT NOT NULL,
    "image_couverture" INTEGER NOT NULL
);

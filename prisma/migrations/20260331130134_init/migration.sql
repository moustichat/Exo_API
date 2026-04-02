-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "heure" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "prix_billet" INTEGER NOT NULL,
    "nombre_total_places" INTEGER NOT NULL,
    "categorie" TEXT NOT NULL,
    "image_couverture" INTEGER
);
INSERT INTO "new_Event" ("categorie", "date", "description", "heure", "id", "image_couverture", "lieu", "nombre_total_places", "prix_billet", "title", "ville") SELECT "categorie", "date", "description", "heure", "id", "image_couverture", "lieu", "nombre_total_places", "prix_billet", "title", "ville" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

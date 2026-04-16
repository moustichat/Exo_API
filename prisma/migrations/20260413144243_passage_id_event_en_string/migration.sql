/*
  Warnings:

  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duree" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "seats_available" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "picture" INTEGER,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("category", "city", "createdAt", "date", "description", "duree", "id", "location", "organizerId", "picture", "price", "seats_available", "title", "total_seats", "updatedAt") SELECT "category", "city", "createdAt", "date", "description", "duree", "id", "location", "organizerId", "picture", "price", "seats_available", "title", "total_seats", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "qrCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("eventId", "id", "purchaseDate", "qrCode", "status", "userId") SELECT "eventId", "id", "purchaseDate", "qrCode", "status", "userId" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_qrCode_key" ON "Ticket"("qrCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

/*
  Warnings:

  - You are about to drop the `Owner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Person_document_number_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Owner";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Owner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "person_id" INTEGER NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "daily_withdrawal_limit" DECIMAL NOT NULL DEFAULT 500,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'corrente',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Account_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Owner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("balance", "created_at", "daily_withdrawal_limit", "id", "is_active", "person_id", "type", "updated_at") SELECT "balance", "created_at", "daily_withdrawal_limit", "id", "is_active", "person_id", "type", "updated_at" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Owner_document_number_key" ON "Owner"("document_number");

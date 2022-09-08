/*
  Warnings:

  - The primary key for the `AccountOwner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `AccountOwner` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountOwner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT "AccountOwner_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccountOwner_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccountOwner" ("account_id", "owner_id") SELECT "account_id", "owner_id" FROM "AccountOwner";
DROP TABLE "AccountOwner";
ALTER TABLE "new_AccountOwner" RENAME TO "AccountOwner";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

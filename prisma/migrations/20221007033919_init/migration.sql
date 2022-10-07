/*
  Warnings:

  - Added the required column `type` to the `Operation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Operation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Operation_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Operation" ("account_id", "amount", "created_at", "id", "updated_at") SELECT "account_id", "amount", "created_at", "id", "updated_at" FROM "Operation";
DROP TABLE "Operation";
ALTER TABLE "new_Operation" RENAME TO "Operation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

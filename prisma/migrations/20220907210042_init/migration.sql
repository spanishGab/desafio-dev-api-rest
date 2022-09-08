-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "owner_id" INTEGER NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "daily_withdrawal_limit" DECIMAL DEFAULT 500,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'corrente',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Account_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("balance", "created_at", "daily_withdrawal_limit", "id", "is_active", "owner_id", "type", "updated_at") SELECT "balance", "created_at", "daily_withdrawal_limit", "id", "is_active", "owner_id", "type", "updated_at" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

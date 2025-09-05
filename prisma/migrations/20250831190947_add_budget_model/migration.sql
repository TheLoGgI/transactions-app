/*
  Warnings:

  - You are about to drop the column `categoryId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `subcategories` table. All the data in the column will be lost.
  - You are about to drop the column `prefix` on the `subcategories` table. All the data in the column will be lost.
  - Added the required column `color` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `subcategories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "budgets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'MONTHLY',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_categories" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "categories";
DROP TABLE "categories";
ALTER TABLE "new_categories" RENAME TO "categories";
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE INDEX "categories_name_idx" ON "categories"("name");
CREATE TABLE "new_subcategories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" INTEGER,
    CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_subcategories" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "subcategories";
DROP TABLE "subcategories";
ALTER TABLE "new_subcategories" RENAME TO "subcategories";
CREATE INDEX "subcategories_name_idx" ON "subcategories"("name");
CREATE TABLE "new_transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionKey" TEXT NOT NULL,
    "merchantId" TEXT,
    "senderId" TEXT,
    "agent" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "subcategoryId" INTEGER,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "sender" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_transaction" ("agent", "amount", "createdAt", "currencyCode", "id", "merchantId", "senderId", "subcategoryId", "transactionKey", "transactionType", "updatedAt") SELECT "agent", "amount", "createdAt", "currencyCode", "id", "merchantId", "senderId", "subcategoryId", "transactionKey", "transactionType", "updatedAt" FROM "transaction";
DROP TABLE "transaction";
ALTER TABLE "new_transaction" RENAME TO "transaction";
CREATE UNIQUE INDEX "transaction_transactionKey_key" ON "transaction"("transactionKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "budgets_categoryId_key" ON "budgets"("categoryId");

-- CreateIndex
CREATE INDEX "budgets_categoryId_idx" ON "budgets"("categoryId");

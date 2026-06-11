/*
  Warnings:

  - You are about to drop the column `company` on the `Inquiry` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Inquiry` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Inquiry` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `Inquiry` table. All the data in the column will be lost.
  - Added the required column `budget` to the `Inquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerEmail` to the `Inquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerName` to the `Inquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerWhatsapp` to the `Inquiry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "merchantId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerWhatsapp" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inquiry_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inquiry" ("country", "createdAt", "id", "merchantId", "message", "productId", "quantity", "status") SELECT "country", "createdAt", "id", "merchantId", "message", "productId", "quantity", "status" FROM "Inquiry";
DROP TABLE "Inquiry";
ALTER TABLE "new_Inquiry" RENAME TO "Inquiry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

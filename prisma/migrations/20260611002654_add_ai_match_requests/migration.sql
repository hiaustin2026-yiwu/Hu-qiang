-- CreateTable
CREATE TABLE "AIMatchRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productKeyword" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "resultProductIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

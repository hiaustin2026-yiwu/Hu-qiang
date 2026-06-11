-- CreateTable
CREATE TABLE "CollectionTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantName" TEXT NOT NULL,
    "marketLocation" TEXT NOT NULL,
    "boothNumber" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wechat" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "visitedAt" DATETIME,
    "photoStatus" TEXT NOT NULL,
    "skuCount" INTEGER NOT NULL DEFAULT 0,
    "authorizationStatus" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

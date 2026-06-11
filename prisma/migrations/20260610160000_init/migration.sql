-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "booth" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wechat" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nameCN" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "moq" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "package" TEXT NOT NULL,
    "leadTime" TEXT NOT NULL,
    "descriptionCN" TEXT NOT NULL,
    "descriptionEN" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

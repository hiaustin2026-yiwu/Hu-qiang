# YiwuChristmas.ai Data Import Guide

This guide describes the first data import mechanism for suppliers, store photos, product photos, and SKU records.

## Current Data Source

The website currently reads mock data from:

- `data/categories.ts`
- `data/suppliers.ts`
- `data/products.ts`

Future real imports should generate database records first, then the frontend can read from PostgreSQL through Prisma instead of static TypeScript files.

## Supplier Fields

Use `data/suppliers-template.csv` as the supplier template.

Required fields:

- `id`
- `companyNameZh`
- `companyNameEn`
- `boothNumber`
- `marketDistrict`
- `mainCategories`
- `phone`
- `whatsapp`
- `email`
- `addressZh`
- `addressEn`
- `descriptionZh`
- `descriptionEn`
- `coverImage`
- `storeImages`
- `verified`
- `rating`

Optional fields already supported:

- `contactName`
- `wechat`
- `floor`
- `supplierType`
- `reviewCount`

For multi-value fields such as `mainCategories` and `storeImages`, separate values with semicolons:

```csv
cat_trees;cat_ornaments;cat_lights
/images/suppliers/sup_shuangyuan/cover.jpg;/images/suppliers/sup_shuangyuan/store-01.jpg
```

## Product SKU Fields

Use `data/products-template.csv` as the product template.

For quick product imports, use the simple template:

```text
SKU
Product
Material
Category
English
Chinese
Tags
```

Example:

```csv
SKU,Product,Material,Category,English,Chinese,Tags
SKU0001,Christmas Ball,Plastic shatterproof ball with glitter finish,Christmas Ball,Red & Gold Shatterproof Christmas Ball,红金防碎圣诞球,"Christmas Ball;Ornaments;Shatterproof;Red Gold"
```

The importer maps `Category = Christmas Ball` to `cat_ornaments`.

Required fields:

- `id`
- `sku`
- `supplierId`
- `categoryId`
- `nameZh`
- `nameEn`
- `descriptionZh`
- `descriptionEn`
- `material`
- `size`
- `color`
- `moq`
- `priceRange`
- `leadTime`
- `packageInfo`
- `images`
- `tags`
- `featured`

Optional fields already supported:

- `aiSimilarity`
- `imagePosition`
- `slug`

For multi-value fields such as `images` and `tags`, separate values with semicolons.

Recommended product image URLs use the SKU folder:

```csv
/products/SKU0001/1.jpg;/products/SKU0001/2.jpg;/products/SKU0001/3.jpg
LED Deer;Outdoor Light;Warm White
```

If the `images` column is empty, the import system automatically generates:

```text
/products/{sku}/1.jpg
/products/{sku}/2.jpg
/products/{sku}/3.jpg
```

## Category IDs

Current category IDs:

- `cat_trees`
- `cat_ornaments`
- `cat_lights`
- `cat_gifts`
- `cat_decorations`
- `cat_party`
- `cat_garlands`
- `cat_stockings`

Each product must use one valid `categoryId`.

## Image Naming Rules

Recommended folder layout:

```text
public/images/suppliers/{supplierId}/cover.jpg
public/images/suppliers/{supplierId}/store-01.jpg
public/images/suppliers/{supplierId}/store-02.jpg
public/products/{sku}/1.jpg
public/products/{sku}/2.jpg
public/products/{sku}/3.jpg
```

Recommended image rules:

- Use lowercase file extensions: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Keep SKU folder names exactly the same as the `sku` field.
- Use `cover.jpg` for supplier cover image.
- Use `1.jpg` for the product main image.
- Use `2.jpg` and `3.jpg` for product detail images.
- Compress images before upload for faster Google SEO performance.

## File Naming Rules

Place real import files in:

```text
data/import/
```

Supported file names:

- `suppliers.csv`
- `suppliers.xlsx`
- `suppliers.xls`
- `suppliers.json`
- `products.csv`
- `products.xlsx`
- `products.xls`
- `products.json`

## Import Commands

Generate normalized JSON from supplier files:

```bash
npm run import:suppliers
```

Generate normalized JSON from product files:

```bash
npm run import:products
```

The current scripts write generated files to:

```text
data/generated/suppliers.generated.json
data/generated/products.generated.json
```

## Future PostgreSQL + Prisma Flow

The reserved database schema lives in:

```text
prisma/schema.prisma
```

Next implementation step:

1. Add PostgreSQL connection in `DATABASE_URL`.
2. Generate Prisma Client.
3. Replace `writeGeneratedJson(...)` in import scripts with Prisma `upsert`.
4. Validate `supplierId` and `categoryId` before import.
5. Add an admin import page for uploading Excel/CSV from the dashboard.

import type { Product } from "@/types/models";

export type ProductImportRow = Record<string, unknown>;

export function text(value: unknown) {
  return String(value ?? "").trim();
}

export function boolValue(value: unknown) {
  const normalized = text(value).toLowerCase();
  return ["true", "yes", "1", "featured", "verified", "y"].includes(normalized);
}

export function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function listValue(value: unknown) {
  return text(value)
    .split(/[;|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function skuImagePaths(sku: string) {
  return [`/products/${sku}/1.jpg`, `/products/${sku}/2.jpg`, `/products/${sku}/3.jpg`];
}

export function categoryIdFromImport(value: unknown) {
  const raw = text(value);
  if (raw.startsWith("cat_")) return raw;

  const normalized = raw.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const categoryMap: Record<string, string> = {
    "christmas tree": "cat_trees",
    "christmas trees": "cat_trees",
    "tree": "cat_trees",
    "trees": "cat_trees",
    "christmas ball": "cat_ornaments",
    "christmas balls": "cat_ornaments",
    "christmas ornament": "cat_ornaments",
    "christmas ornaments": "cat_ornaments",
    "ornament": "cat_ornaments",
    "ornaments": "cat_ornaments",
    "led lights": "cat_lights",
    "christmas lights": "cat_lights",
    "lights": "cat_lights",
    "christmas gifts": "cat_gifts",
    "gift": "cat_gifts",
    "gifts": "cat_gifts",
    "christmas decorations": "cat_decorations",
    "decoration": "cat_decorations",
    "decorations": "cat_decorations",
    "party decoration": "cat_party",
    "party supplies": "cat_party",
    "wreath": "cat_garlands",
    "wreaths": "cat_garlands",
    "garland": "cat_garlands",
    "garlands": "cat_garlands",
    "garlands and wreaths": "cat_garlands",
    "christmas stocking": "cat_stockings",
    "christmas stockings": "cat_stockings",
    "stocking": "cat_stockings",
    "stockings": "cat_stockings"
  };

  return categoryMap[normalized] ?? "cat_decorations";
}

export function normalizeProductRow(row: ProductImportRow, index: number): Product {
  const productName = text(row.Product || row.product || row.productName || row.name);
  const nameEn = text(row.nameEn || row.English || row.english || row.productName || row.name) || productName;
  const nameZh = text(row.nameZh || row.Chinese || row.chinese || row.productNameZh) || productName;
  const fallbackSlug = slugify(text(row.slug) || nameEn || nameZh || `product-${index + 1}`);
  const sku = text(row.sku || row.SKU) || `YC-SKU-${String(index + 1).padStart(4, "0")}`;

  const images = listValue(row.images || row.Images);

  return {
    id: text(row.id) || `prod_${fallbackSlug}`,
    sku,
    supplierId: text(row.supplierId || row.Supplier) || "sup_shuangyuan",
    categoryId: categoryIdFromImport(row.categoryId || row.Category || row.category),
    slug: fallbackSlug,
    nameZh: nameZh || nameEn,
    nameEn: nameEn || nameZh,
    descriptionZh: text(row.descriptionZh) || `${nameZh || nameEn}，来自义乌圣诞用品供应商。`,
    descriptionEn: text(row.descriptionEn) || `${nameEn || nameZh} sourced from Yiwu Christmas suppliers.`,
    material: text(row.material || row.Material),
    size: text(row.size || row.Size),
    color: text(row.color || row.Color),
    moq: text(row.moq || row.MOQ),
    priceRange: text(row.priceRange || row.Price || row.price),
    leadTime: text(row.leadTime || row["Lead Time"]),
    packageInfo: text(row.packageInfo || row.Package || row.package || row.packaging),
    images: images.length > 0 ? images : skuImagePaths(sku),
    tags: listValue(row.tags || row.Tags),
    featured: boolValue(row.featured),
    aiSimilarity: numberValue(row.aiSimilarity, 0),
    imagePosition: text(row.imagePosition) || "50% 50%"
  };
}

export function mergeProducts(baseProducts: Product[], generatedProducts: Product[]) {
  const map = new Map<string, Product>();
  for (const product of baseProducts) map.set(product.id, product);
  for (const product of generatedProducts) map.set(product.id, product);
  return Array.from(map.values());
}

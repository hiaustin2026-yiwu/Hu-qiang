import type { Locale } from "@/config/i18n";
import type { Category, Product, Supplier } from "@/types/models";

export const imageFallback = "/images/yiwu-christmas-store.jpeg";

export function categoryDisplayName(category: Category, locale: Locale) {
  return locale === "zh" ? category.nameZh : category.nameEn;
}

export function categoryDescription(category: Category, locale: Locale) {
  return locale === "zh" ? category.descriptionZh : category.descriptionEn;
}

export function productDisplayName(product: Product, locale: Locale) {
  return locale === "zh" ? product.nameZh : product.nameEn;
}

export function productDescription(product: Product, locale: Locale) {
  return locale === "zh" ? product.descriptionZh : product.descriptionEn;
}

export function productPriceRange(product: Product) {
  return product.priceRange;
}

export function supplierDisplayName(supplier: Supplier, locale: Locale) {
  return locale === "zh" ? supplier.companyNameZh : supplier.companyNameEn;
}

export function supplierDescription(supplier: Supplier, locale: Locale) {
  return locale === "zh" ? supplier.descriptionZh : supplier.descriptionEn;
}

export function supplierAddress(supplier: Supplier, locale: Locale) {
  return locale === "zh" ? supplier.addressZh : supplier.addressEn;
}

export function firstImage(images?: string[], fallback = imageFallback) {
  return images?.find(Boolean) ?? fallback;
}

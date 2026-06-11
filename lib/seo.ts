import { brandConfig } from "@/config/brand";
import type { Locale } from "@/config/i18n";
import type { Product } from "@/types/models";
import { firstImage, productDescription, productDisplayName, productPriceRange } from "@/lib/format";

export function absoluteUrl(path = "") {
  const domain = brandConfig.domains.primary;
  return `https://${domain}${path}`;
}

export function productMeta(product: Product, locale: Locale) {
  const name = productDisplayName(product, locale);
  const description = productDescription(product, locale);
  return {
    title: `${name} | Yiwu Christmas Supplier | ${brandConfig.currentBrand}`,
    description: `${description} Price ${productPriceRange(product)}, MOQ ${product.moq}, lead time ${product.leadTime}.`
  };
}

export function productSchema(product: Product, locale: Locale) {
  const name = productDisplayName(product, locale);
  const description = productDescription(product, locale);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku: product.sku,
    image: absoluteUrl(firstImage(product.images)),
    brand: {
      "@type": "Brand",
      name: brandConfig.currentBrand
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/${locale}/products/${product.slug}`)
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "MOQ", value: product.moq },
      { "@type": "PropertyValue", name: "Material", value: product.material },
      { "@type": "PropertyValue", name: "Size", value: product.size },
      { "@type": "PropertyValue", name: "Lead Time", value: product.leadTime },
      { "@type": "PropertyValue", name: "AI Similarity", value: product.aiSimilarity ? `${product.aiSimilarity}%` : "Pending" }
    ]
  };
}

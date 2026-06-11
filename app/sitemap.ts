import type { MetadataRoute } from "next";
import { locales } from "@/config/i18n";
import { products, suppliers } from "@/data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/products", "/suppliers", "/about", "/contact"];
  return [
    ...locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        url: absoluteUrl(`/${locale}${route}`),
        lastModified: new Date()
      }))
    ),
    ...locales.flatMap((locale) =>
      products.map((product) => ({
        url: absoluteUrl(`/${locale}/products/${product.slug}`),
        lastModified: new Date()
      }))
    ),
    ...locales.flatMap((locale) =>
      suppliers.map((supplier) => ({
        url: absoluteUrl(`/${locale}/suppliers/${supplier.slug}`),
        lastModified: new Date()
      }))
    )
  ];
}

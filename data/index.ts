export { categories } from "./categories";
export { suppliers } from "./suppliers";

import generatedProductsJson from "./generated/products.generated.json";
import { products as baseProducts } from "./products";
import { mergeProducts } from "@/lib/product-import";
import type { Product } from "@/types/models";

export const products = mergeProducts(baseProducts, generatedProductsJson as Product[]);

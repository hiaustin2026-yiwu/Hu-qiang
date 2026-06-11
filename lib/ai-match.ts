import type { Prisma } from "@prisma/client";

export type MatchableProduct = Prisma.ProductGetPayload<{
  include: { merchant: true; images: true };
}>;

export type AIMatchInput = {
  budget: string;
  category: string;
  country: string;
  message: string;
  productKeyword: string;
  quantity: string;
};

export type AIMatchResult = {
  product: MatchableProduct;
  score: number;
};

export function rankProductsForAiMatch(products: MatchableProduct[], input: AIMatchInput) {
  return products
    .map((product) => ({ product, score: scoreProduct(product, input) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function scoreProduct(product: MatchableProduct, input: AIMatchInput) {
  const keyword = normalize(input.productKeyword);
  const category = normalize(input.category);
  const message = normalize(input.message);
  const requestedQuantity = numberFromText(input.quantity);
  const budget = numberFromText(input.budget);
  const productText = normalize([product.nameEN, product.nameCN, product.sku, product.category, product.material, product.descriptionEN, product.descriptionCN].join(" "));

  let score = 0;
  if (keyword) {
    const keywordTokens = keyword.split(" ").filter(Boolean);
    for (const token of keywordTokens) {
      if (productText.includes(token)) score += 18;
    }
    if (normalize(product.nameEN).includes(keyword) || normalize(product.nameCN).includes(keyword)) score += 28;
  }

  if (category && normalize(product.category).includes(category)) score += 24;
  if (message) {
    for (const token of message.split(" ").filter((item) => item.length > 2)) {
      if (productText.includes(token)) score += 3;
    }
  }

  const moq = numberFromText(product.moq);
  if (requestedQuantity > 0 && moq > 0) {
    score += moq <= requestedQuantity ? 18 : Math.max(0, 8 - Math.ceil((moq - requestedQuantity) / Math.max(requestedQuantity, 1)));
  }

  const price = averagePrice(product.price);
  if (budget > 0 && price > 0) {
    const estimatedTotal = requestedQuantity > 0 ? price * requestedQuantity : price;
    const distance = Math.abs(estimatedTotal - budget) / Math.max(budget, 1);
    score += Math.max(0, 18 - Math.round(distance * 18));
  }

  if (product.merchant.verified) score += 12;
  if (product.images.length >= 3) score += 10;
  else if (product.images.length > 0) score += 5;
  if (product.status === "active") score += 6;

  return score;
}

export function numberFromText(value: string) {
  const match = value.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function averagePrice(value: string) {
  const numbers = value
    .replace(/,/g, "")
    .match(/\d+(\.\d+)?/g)
    ?.map(Number)
    .filter((item) => Number.isFinite(item));
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, item) => sum + item, 0) / numbers.length;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, " ").trim();
}

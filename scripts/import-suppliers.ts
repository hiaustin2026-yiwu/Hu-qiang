import type { Supplier } from "@/types/models";
import { boolValue, findImportFiles, listValue, numberValue, readRows, slugify, text, writeGeneratedJson } from "./import-utils";

function normalizeSupplier(row: Record<string, unknown>, index: number): Supplier {
  const companyNameZh = text(row.companyNameZh);
  const companyNameEn = text(row.companyNameEn);
  const fallbackId = slugify(companyNameEn || companyNameZh || `supplier-${index + 1}`);
  const id = text(row.id) || `sup_${fallbackId}`;

  return {
    id,
    slug: text(row.slug) || fallbackId,
    storefrontImage: text(row.storefrontImage) || text(row.coverImage) || "/images/yiwu-christmas-store.jpeg",
    businessName: text(row.businessName) || companyNameEn || companyNameZh,
    category: text(row.category) || listValue(row.mainCategories).join(", "),
    marketAddress: text(row.marketAddress) || text(row.addressEn) || text(row.addressZh),
    companyNameZh,
    companyNameEn,
    boothNumber: text(row.boothNumber),
    marketDistrict: text(row.marketDistrict),
    mainCategories: listValue(row.mainCategories),
    phone: text(row.phone),
    whatsapp: text(row.whatsapp),
    email: text(row.email),
    addressZh: text(row.addressZh),
    addressEn: text(row.addressEn),
    descriptionZh: text(row.descriptionZh),
    descriptionEn: text(row.descriptionEn),
    coverImage: text(row.coverImage) || "/images/yiwu-christmas-store.jpeg",
    storeImages: listValue(row.storeImages),
    verified: boolValue(row.verified),
    rating: numberValue(row.rating, 0),
    contactName: text(row.contactName),
    wechat: text(row.wechat),
    floor: text(row.floor),
    supplierType: text(row.supplierType) === "Trading Company" ? "Trading Company" : "Factory",
    reviewCount: numberValue(row.reviewCount, 0)
  };
}

async function main() {
  const inputArg = process.argv[2];
  const files = inputArg ? [inputArg] : await findImportFiles("suppliers");
  if (files.length === 0) {
    throw new Error("No supplier import file found. Add suppliers.csv, suppliers.xlsx, suppliers.xls, or suppliers.json to data/import/.");
  }

  const imported: Supplier[] = [];
  for (const file of files) {
    const rows = await readRows(file);
    imported.push(...rows.map((row, index) => normalizeSupplier(row, imported.length + index)));
  }

  const outPath = await writeGeneratedJson("suppliers.generated.json", imported);
  console.log(`Imported ${imported.length} suppliers -> ${outPath}`);
  console.log("Next step: replace JSON output with Prisma upsert when PostgreSQL is connected.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

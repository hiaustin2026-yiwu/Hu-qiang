import type { Product } from "@/types/models";
import { normalizeProductRow } from "@/lib/product-import";
import { findImportFiles, readRows, writeGeneratedJson } from "./import-utils";

async function main() {
  const inputArg = process.argv[2];
  const files = inputArg ? [inputArg] : await findImportFiles("products");
  if (files.length === 0) {
    throw new Error("No product import file found. Add products.csv, products.xlsx, products.xls, or products.json to data/import/.");
  }

  const imported: Product[] = [];
  for (const file of files) {
    const rows = await readRows(file);
    imported.push(...rows.map((row, index) => normalizeProductRow(row, imported.length + index)));
  }

  const outPath = await writeGeneratedJson("products.generated.json", imported);
  console.log(`Imported ${imported.length} products -> ${outPath}`);
  console.log("Next step: replace JSON output with Prisma upsert when PostgreSQL is connected.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

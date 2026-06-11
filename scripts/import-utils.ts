import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
export { boolValue, listValue, numberValue, slugify, text } from "@/lib/product-import";

export type RawRow = Record<string, string | number | boolean | null | undefined>;

export async function readRows(inputPath: string): Promise<RawRow[]> {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === ".json") {
    const raw = await fs.readFile(inputPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error(`JSON import must be an array: ${inputPath}`);
    return parsed as RawRow[];
  }

  if (ext === ".csv") {
    const workbook = XLSX.read(await fs.readFile(inputPath, "utf8"), { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  }

  if (ext === ".xlsx" || ext === ".xls") {
    const workbook = XLSX.readFile(inputPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  }

  throw new Error(`Unsupported import format: ${inputPath}. Use CSV, XLSX, XLS, or JSON.`);
}

export async function findImportFiles(prefix: string) {
  const importDir = path.join(process.cwd(), "data", "import");
  const entries = await fs.readdir(importDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(importDir, entry.name))
    .filter((file) => {
      const base = path.basename(file).toLowerCase();
      return base.startsWith(prefix) && [".csv", ".xlsx", ".xls", ".json"].includes(path.extname(base));
    });
}

export async function writeGeneratedJson(fileName: string, rows: unknown[]) {
  const outDir = path.join(process.cwd(), "data", "generated");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, fileName);
  await fs.writeFile(outPath, `${JSON.stringify(rows, null, 2)}\n`);
  return outPath;
}

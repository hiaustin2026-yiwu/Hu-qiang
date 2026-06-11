import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { listValue, skuImagePaths, text } from "@/lib/product-import";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type RawRow = Record<string, string | number | boolean | null | undefined>;

type FailedImportRow = {
  row: number;
  sku: string;
  reason: string;
  data: RawRow;
};

type SuccessfulImportRow = {
  id: string;
  sku: string;
  nameEn: string;
  nameZh: string;
  merchantId: string;
};

const merchantAliases: Record<string, string> = {
  sup_bairui: "merchant-bairui",
  sup_shuangyuan: "merchant-shuangyuan",
  sup_hongle: "merchant-hongle"
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file. Upload Excel, CSV, or JSON." }, { status: 400 });
    }

    const rows = await readRowsFromFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "No rows found in uploaded file." }, { status: 400 });
    }

    const merchants = await prisma.merchant.findMany({ select: { id: true, name: true } });
    if (merchants.length === 0) {
      return NextResponse.json({ ok: false, error: "No merchant records found. Create merchants before importing products." }, { status: 400 });
    }

    const merchantIds = new Set(merchants.map((merchant) => merchant.id));
    const merchantNameMap = new Map(merchants.map((merchant) => [merchant.name.toLowerCase(), merchant.id]));
    const uploadedSkus = rows.map((row) => readSku(row)).filter(Boolean);
    const existingProducts = await prisma.product.findMany({
      where: { sku: { in: uploadedSkus } },
      select: { sku: true }
    });
    const existingSkuSet = new Set(existingProducts.map((product) => product.sku));
    const seenSkuSet = new Set<string>();
    const successes: SuccessfulImportRow[] = [];
    const failures: FailedImportRow[] = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const sku = readSku(row);

      if (!sku) {
        failures.push({ row: rowNumber, sku: "", reason: "Missing SKU.", data: row });
        continue;
      }

      if (seenSkuSet.has(sku)) {
        failures.push({ row: rowNumber, sku, reason: "Duplicate SKU in uploaded file.", data: row });
        continue;
      }
      seenSkuSet.add(sku);

      if (existingSkuSet.has(sku)) {
        failures.push({ row: rowNumber, sku, reason: "SKU already exists in database.", data: row });
        continue;
      }

      const merchantId = resolveMerchantId(row, merchantIds, merchantNameMap) || merchants[0]?.id;
      if (!merchantId) {
        failures.push({ row: rowNumber, sku, reason: "Missing merchantId or no fallback merchant available.", data: row });
        continue;
      }

      const nameEN = text(row.nameEN || row.nameEn || row.English || row.english || row.Product || row.product || row.productName || row.name);
      const nameCN = text(row.nameCN || row.nameCn || row.Chinese || row.chinese || row.productNameZh || row.Product || row.product || row.name);
      if (!nameEN && !nameCN) {
        failures.push({ row: rowNumber, sku, reason: "Missing product name.", data: row });
        continue;
      }

      try {
        const images = listValue(row.images || row.Images);
        const product = await prisma.product.create({
          data: {
            merchantId,
            sku,
            nameCN: nameCN || nameEN,
            nameEN: nameEN || nameCN,
            category: text(row.category || row.Category || row.categoryId) || "Christmas Decorations",
            material: text(row.material || row.Material) || "Custom material",
            size: text(row.size || row.Size) || "Custom size",
            color: text(row.color || row.Color) || "Custom color",
            moq: text(row.moq || row.MOQ) || "500 pcs",
            price: text(row.price || row.Price || row.priceRange) || "0.50 - 2.50",
            currency: text(row.currency || row.Currency) || "USD",
            packageInfo: text(row.packageInfo || row.Package || row.package || row.packaging) || "OPP bag or color box",
            leadTime: text(row.leadTime || row["Lead Time"] || row.lead_time) || "20-30 days",
            descriptionCN: text(row.descriptionCN || row.descriptionCn || row.descriptionZh) || `${nameCN || nameEN}，来自义乌圣诞用品供应商。`,
            descriptionEN: text(row.descriptionEN || row.descriptionEn || row.description) || `${nameEN || nameCN} sourced from Yiwu Christmas suppliers.`,
            status: text(row.status || row.Status) || "active",
            images: {
              create: (images.length > 0 ? images : skuImagePaths(sku)).map((imageUrl, imageIndex) => ({
                imageUrl,
                sort: imageIndex + 1
              }))
            }
          }
        });

        successes.push({
          id: product.id,
          sku: product.sku,
          nameEn: product.nameEN,
          nameZh: product.nameCN,
          merchantId
        });
      } catch (error) {
        failures.push({
          row: rowNumber,
          sku,
          reason: error instanceof Error ? error.message : "Database insert failed.",
          data: row
        });
      }
    }

    safeRevalidatePaths([
      "/zh/dashboard/admin/products",
      "/en/dashboard/admin/products",
      "/zh/products",
      "/en/products",
      "/zh",
      "/en"
    ]);

    return NextResponse.json({
      ok: true,
      total: rows.length,
      successCount: successes.length,
      failureCount: failures.length,
      products: successes,
      failures,
      failureCsv: failures.length > 0 ? buildFailureCsv(failures) : ""
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Import failed." }, { status: 400 });
  }
}

async function readRowsFromFile(file: File): Promise<RawRow[]> {
  const ext = path.extname(file.name).toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === ".json") {
    const parsed = JSON.parse(buffer.toString("utf8")) as unknown;
    if (!Array.isArray(parsed)) throw new Error("JSON import must be an array.");
    return parsed as RawRow[];
  }

  if (ext === ".csv") {
    const workbook = XLSX.read(buffer.toString("utf8"), { type: "string" });
    return rowsFromWorkbook(workbook);
  }

  if (ext === ".xlsx" || ext === ".xls") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    return rowsFromWorkbook(workbook);
  }

  throw new Error("Unsupported file type. Use .xlsx, .xls, .csv, or .json.");
}

function rowsFromWorkbook(workbook: XLSX.WorkBook): RawRow[] {
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return [];
  return XLSX.utils.sheet_to_json<RawRow>(workbook.Sheets[firstSheet], { defval: "" });
}

function readSku(row: RawRow) {
  return text(row.sku || row.SKU || row.Sku);
}

function resolveMerchantId(row: RawRow, merchantIds: Set<string>, merchantNameMap: Map<string, string>) {
  const raw = text(row.merchantId || row.supplierId || row.Supplier || row.supplier || row.Merchant || row.merchant);
  if (!raw) return "";
  if (merchantIds.has(raw)) return raw;
  if (merchantAliases[raw]) return merchantAliases[raw];
  return merchantNameMap.get(raw.toLowerCase()) || "";
}

function buildFailureCsv(failures: FailedImportRow[]) {
  const fieldNames = Array.from(new Set(failures.flatMap((failure) => Object.keys(failure.data))));
  const headers = ["row", "sku", "reason", ...fieldNames];
  const lines = [
    headers.map(csvCell).join(","),
    ...failures.map((failure) =>
      [
        failure.row,
        failure.sku,
        failure.reason,
        ...fieldNames.map((field) => text(failure.data[field]))
      ]
        .map(csvCell)
        .join(",")
    )
  ];
  return `${lines.join("\n")}\n`;
}

function csvCell(value: unknown) {
  const raw = text(value);
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function safeRevalidatePaths(paths: string[]) {
  for (const item of paths) {
    try {
      revalidatePath(item);
    } catch {
      // Direct route invocation in local scripts has no Next.js static generation store.
    }
  }
}

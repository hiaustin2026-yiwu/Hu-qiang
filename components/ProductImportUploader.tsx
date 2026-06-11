"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type ImportedProduct = {
  id: string;
  sku: string;
  nameEn?: string;
  nameZh?: string;
  merchantId?: string;
};

type ImportResponse = {
  ok: boolean;
  total?: number;
  successCount?: number;
  failureCount?: number;
  products?: ImportedProduct[];
  failureCsv?: string;
  error?: string;
};

export function ProductImportUploader() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("Upload Excel, CSV, or JSON product SKU file. The system checks duplicate SKU and writes valid rows to database.");
  const [products, setProducts] = useState<ImportedProduct[]>([]);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });
  const [failureCsv, setFailureCsv] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!file) {
      setStatus("error");
      setMessage("Please choose an Excel, CSV, or JSON file first.");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading, parsing rows, checking duplicate SKU, and writing database...");
    setProducts([]);
    setSummary({ total: 0, success: 0, failed: 0 });
    setFailureCsv("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import/products", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as ImportResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Import failed.");
      }

      setStatus("done");
      setSummary({
        total: result.total ?? 0,
        success: result.successCount ?? 0,
        failed: result.failureCount ?? 0
      });
      setFailureCsv(result.failureCsv ?? "");
      setMessage(`Import finished. Success: ${result.successCount ?? 0}. Failed: ${result.failureCount ?? 0}.`);
      setProducts(result.products ?? []);
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Import failed.");
    }
  }

  function downloadFailureCsv() {
    if (!failureCsv) return;
    const blob = new Blob([failureCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-import-failures.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-[24px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
      <div className="grid gap-4 md:grid-cols-4">
        {["CSV / Excel", "Parse", "Check SKU", "Write DB"].map((step, index) => (
          <div key={step} className="rounded-[16px] bg-[#f5f7f6] p-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#013f29] text-sm font-black text-white">{index + 1}</span>
            <strong className="mt-3 block">{step}</strong>
          </div>
        ))}
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-[1fr_180px]" onSubmit={handleSubmit}>
        <label className="grid min-h-20 cursor-pointer place-items-center rounded-[18px] border border-dashed border-[#b6c5be] bg-[#eefaf5] px-4 text-center">
          <span className="font-black text-[#013f29]">Choose Excel / CSV / JSON</span>
          <input className="sr-only" name="file" type="file" accept=".xlsx,.xls,.csv,.json" />
        </label>
        <button
          className="min-h-14 rounded-[18px] bg-[#ef3340] px-5 font-black text-white disabled:cursor-not-allowed disabled:bg-[#c8d0cc]"
          type="submit"
          disabled={status === "uploading"}
        >
          {status === "uploading" ? "Uploading..." : "Upload"}
        </button>
      </form>

      <p className={`mt-4 rounded-[14px] px-4 py-3 text-sm font-black ${status === "error" ? "bg-[#fff1f2] text-[#be123c]" : "bg-[#f5f7f6] text-[#39413e]"}`}>
        {message}
      </p>

      {status === "done" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[14px] bg-[#f5f7f6] p-4">
            <small className="block font-black uppercase text-[#5f6864]">Total Rows</small>
            <strong className="mt-1 block text-3xl font-black">{summary.total}</strong>
          </div>
          <div className="rounded-[14px] bg-[#eefaf5] p-4">
            <small className="block font-black uppercase text-[#0b8f5a]">Success</small>
            <strong className="mt-1 block text-3xl font-black text-[#0b8f5a]">{summary.success}</strong>
          </div>
          <div className="rounded-[14px] bg-[#fff1f2] p-4">
            <small className="block font-black uppercase text-[#be123c]">Failed</small>
            <strong className="mt-1 block text-3xl font-black text-[#be123c]">{summary.failed}</strong>
          </div>
        </div>
      ) : null}

      {failureCsv ? (
        <button className="mt-4 rounded-md border border-[#be123c] px-4 py-3 text-sm font-black text-[#be123c]" type="button" onClick={downloadFailureCsv}>
          Download Failure Reasons CSV
        </button>
      ) : null}

      <div className="mt-4 rounded-[14px] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#7c2d12]">
        <strong>Image folder rule:</strong> put product photos in <code>public/products/SKU0001/</code> as <code>1.jpg</code>, <code>2.jpg</code>, <code>3.jpg</code>.
        If Excel leaves <code>images</code> empty, the system auto-links these three images by SKU.
      </div>

      <div className="mt-4 rounded-[14px] bg-[#eefaf5] px-4 py-3 text-sm leading-6 text-[#064e3b]">
        <strong>Simple Excel fields:</strong> <code>SKU</code>, <code>Product</code>, <code>Material</code>, <code>Category</code>, <code>English</code>, <code>Chinese</code>, <code>Tags</code>.
        Example: <code>Category = Christmas Ball</code> maps to Christmas Ornaments.
      </div>

      {products.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#e6e1d8]">
          <div className="grid grid-cols-[1fr_1fr_120px] bg-[#013f29] px-4 py-3 text-sm font-black text-white">
            <span>SKU</span>
            <span>Name</span>
            <span>Merchant</span>
          </div>
          {products.slice(0, 12).map((product) => (
            <div key={product.id} className="grid grid-cols-[1fr_1fr_120px] border-t border-[#edf1ef] px-4 py-3 text-sm">
              <strong>{product.sku}</strong>
              <span>{product.nameEn || product.nameZh}</span>
              <span className="font-black text-[#0b8f5a]">{product.merchantId}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

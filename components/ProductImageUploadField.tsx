"use client";

import { useState } from "react";

type UploadedImage = {
  format: string;
  path: string;
  width: number;
};

type UploadResponse = {
  ok: boolean;
  error?: string;
  files?: UploadedImage[];
};

type ProductImageUploadFieldProps = {
  defaultValue?: string;
};

export function ProductImageUploadField({ defaultValue = "" }: ProductImageUploadFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("Upload product images or paste one image URL per line.");

  async function handleUpload(file?: File) {
    if (!file) return;
    setStatus("uploading");
    setMessage("Uploading and generating 800px / 400px webp + jpg...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as UploadResponse;
      if (!response.ok || !result.ok) throw new Error(result.error || "Upload failed.");

      const generated = result.files?.map((item) => item.path) ?? [];
      setValue((current) => [current, ...generated].filter(Boolean).join("\n"));
      setStatus("done");
      setMessage(`Generated ${generated.length} image files in /public/uploads/.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      Product Images
      <div className="grid gap-3 rounded-md border border-[#dde4e0] bg-[#f5f7f6] p-3">
        <input className="max-w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleUpload(event.target.files?.[0])} />
        <textarea
          name="images"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-28 rounded-md border border-[#dde4e0] bg-white px-3 py-3 font-medium outline-none focus:border-[#013f29]"
          placeholder="/uploads/product-800.webp&#10;/uploads/product-800.jpg"
        />
        <p className={`text-xs font-black ${status === "error" ? "text-[#be123c]" : "text-[#5f6864]"}`}>{message}</p>
      </div>
    </label>
  );
}

"use client";

import type { FormEvent } from "react";
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
  original?: {
    name: string;
    size: number;
    type: string;
  };
};

export function ImageUploadManager() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("Upload JPG, PNG, or WEBP. The system generates 800px and 400px WebP/JPG files.");
  const [files, setFiles] = useState<UploadedImage[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!file) {
      setStatus("error");
      setMessage("Please choose an image first.");
      return;
    }

    setStatus("uploading");
    setMessage("Compressing image and generating 800px / 400px versions...");
    setFiles([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      setStatus("done");
      setMessage(`Generated ${result.files?.length ?? 0} files in /public/uploads/.`);
      setFiles(result.files ?? []);
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <section className="rounded-[18px] border border-[#dde4e0] bg-white p-6 soft-shadow">
      <div className="mb-6">
        <p className="text-xs font-black uppercase text-[#b91c1c]">Media Upload</p>
        <h3 className="mt-2 text-3xl font-black tracking-normal">Upload image and generate web assets</h3>
        <p className="mt-3 max-w-3xl leading-7 text-[#5f6864]">
          Files are compressed on the server and saved under <code>public/uploads/</code> as 800px WebP, 800px JPG, 400px WebP, and 400px JPG.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-[1fr_180px]" onSubmit={handleSubmit}>
        <label className="grid min-h-24 cursor-pointer place-items-center rounded-[18px] border border-dashed border-[#b6c5be] bg-[#eefaf5] px-4 text-center">
          <span className="font-black text-[#013f29]">Choose Image</span>
          <small className="mt-1 block font-bold text-[#5f6864]">JPG, PNG, WEBP</small>
          <input className="sr-only" name="file" type="file" accept="image/jpeg,image/png,image/webp" />
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

      {files.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {files.map((file) => (
            <article key={file.path} className="overflow-hidden rounded-[16px] border border-[#dde4e0] bg-[#f5f7f6]">
              <img className="h-36 w-full object-cover" src={file.path} alt={`${file.width}px ${file.format}`} />
              <div className="p-4">
                <strong className="block text-sm uppercase text-[#013f29]">
                  {file.width}px {file.format}
                </strong>
                <code className="mt-2 block break-all text-xs text-[#5f6864]">{file.path}</code>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

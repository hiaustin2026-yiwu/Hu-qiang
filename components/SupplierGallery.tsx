"use client";

import { useMemo, useState } from "react";
import type { Supplier } from "@/types/models";
import { firstImage } from "@/lib/format";

type SupplierGalleryProps = {
  supplier: Supplier;
};

export function SupplierGallery({ supplier }: SupplierGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const images = useMemo(
    () => [supplier.coverImage, ...supplier.storeImages, ...(supplier.factoryImages ?? [])].filter(Boolean),
    [supplier.coverImage, supplier.factoryImages, supplier.storeImages]
  );

  const visibleImages = images.length > 0 ? images : [firstImage()];

  return (
    <div className="grid gap-4">
      <button
        className="min-h-[320px] rounded-[24px] bg-cover bg-center text-left soft-shadow"
        style={{ backgroundImage: `url(${firstImage(visibleImages)})` }}
        type="button"
        onClick={() => setActiveImage(firstImage(visibleImages))}
      >
        <span className="sr-only">Open supplier banner image</span>
      </button>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {visibleImages.slice(0, 10).map((image, index) => (
          <button
            key={`${image}-${index}`}
            className="aspect-square rounded-[14px] bg-cover bg-center ring-1 ring-[#e6e1d8] transition hover:ring-[#0b8f5a]"
            style={{ backgroundImage: `url(${image})` }}
            type="button"
            onClick={() => setActiveImage(image)}
          >
            <span className="sr-only">Open supplier gallery image {index + 1}</span>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close gallery" onClick={() => setActiveImage(null)} />
          <div className="relative w-full max-w-5xl">
            <button
              className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black text-[#101615]"
              type="button"
              aria-label="Close gallery"
              onClick={() => setActiveImage(null)}
            >
              ×
            </button>
            <img className="max-h-[82vh] w-full rounded-[22px] object-contain bg-white" src={activeImage} alt="Supplier gallery preview" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

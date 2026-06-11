"use client";

import { useMemo, useState } from "react";
import { firstImage } from "@/lib/format";
import { SafeImage } from "@/components/SafeImage";

type ProductGalleryProps = {
  images: string[];
  title: string;
  position?: string;
};

export function ProductGallery({ images, title, position = "50% 50%" }: ProductGalleryProps) {
  const visibleImages = useMemo(() => (images.length > 0 ? images : [firstImage()]), [images]);
  const [selectedImage, setSelectedImage] = useState(firstImage(visibleImages));
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <button
        className="overflow-hidden rounded-[24px] bg-white soft-shadow"
        type="button"
        onClick={() => setZoomImage(selectedImage)}
      >
        <SafeImage className="h-[360px] w-full object-cover md:h-[560px]" src={selectedImage} alt={title} />
        <span className="sr-only">Open product image</span>
      </button>

      <div className="grid grid-cols-4 gap-3">
        {visibleImages.slice(0, 8).map((image, index) => (
          <button
            key={`${image}-${index}`}
            className={`aspect-square overflow-hidden rounded-[14px] bg-white ring-2 transition ${image === selectedImage ? "ring-[#0b8f5a]" : "ring-[#e6e1d8] hover:ring-[#0b8f5a]"}`}
            type="button"
            onClick={() => setSelectedImage(image)}
          >
            <SafeImage className="h-full w-full object-cover" src={image} alt={`${title} thumbnail ${index + 1}`} />
            <span className="sr-only">Select product image {index + 1}</span>
          </button>
        ))}
      </div>

      {zoomImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Close image preview" onClick={() => setZoomImage(null)} />
          <div className="relative w-full max-w-5xl">
            <button
              className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black text-[#101615]"
              type="button"
              aria-label="Close image preview"
              onClick={() => setZoomImage(null)}
            >
              ×
            </button>
            <SafeImage className="max-h-[82vh] w-full rounded-[22px] bg-white object-contain" src={zoomImage} alt={title} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

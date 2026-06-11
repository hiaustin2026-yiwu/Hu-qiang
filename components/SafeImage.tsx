"use client";

import { useState } from "react";
import { imageFallback } from "@/lib/format";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
};

export function SafeImage({ src, alt, className = "", fallback = imageFallback }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  return (
    <img
      className={className}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}

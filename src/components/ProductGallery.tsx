"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-cream text-neutral-400">
        No image available
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-cream">
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                i === active ? "border-brand" : "border-black/10"
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

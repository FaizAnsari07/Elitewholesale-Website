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
      <div className="flex aspect-square w-full items-center justify-center glass rounded-2xl text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden glass rounded-2xl">
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8"
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
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-foreground/5 ${
                i === active ? "border-primary" : "border-border"
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

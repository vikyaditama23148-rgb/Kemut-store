"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      {/* Main image */}
      <div className="aspect-[4/5] bg-[#efeeeb] overflow-hidden relative">
        <Image
          src={images[active]}
          alt={productName}
          fill
          priority
          className="object-cover transition-opacity duration-500"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-[2px] mt-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square bg-[#efeeeb] overflow-hidden transition-opacity duration-200 ${
                active === i
                  ? "opacity-100 ring-1 ring-black"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} ${i + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
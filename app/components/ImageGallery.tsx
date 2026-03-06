'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="flex flex-col gap-2 sm:gap-4 w-full flex-1">
      {/* Main image with arrows */}
      <div className="relative flex-1 min-h-[180px] sm:min-h-[200px]   rounded-[1rem] overflow-hidden  flex items-center justify-center">
        <img
          src={images[current]}
          alt={`${alt} - ${current + 1}`}
          className="w-full h-full object-contain rounded-[1rem] rounded-b-[0px]"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-3 p-2  w-[70%] h-20 sm:w-[80%] mx-auto   backdrop-blur-lg rounded-[0.5rem] overflow-x-auto overflow-y-hidden">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-[0.5rem] overflow-hidden border-2 transition-all flex-shrink-0 ${
                i === current
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
              style={{ width: 70, height: 50 }}
            >
              <img
                src={img}
                alt={`${alt} thumb ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

interface BrandIconProps {
  brand: string;
  width?: number;
  height?: number;
}

export default function BrandIcon({ brand, width = 25, height = 25 }: BrandIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      src={`/icon/brands/${brand}.svg`}
      alt={brand}
      width={width}
      height={height}
      onError={() => setFailed(true)}
    />
  );
}

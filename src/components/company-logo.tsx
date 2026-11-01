'use client';

import { useState, useEffect } from 'react';

interface CompanyLogoProps {
  src: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function CompanyLogo({ src, name, className, fallbackClassName }: CompanyLogoProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  if (imgSrc && !error) {
    return (
      <img
        src={imgSrc}
        alt={`Logo ${name}`}
        className={className}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={[
        'flex items-center justify-center font-black text-slate-900 select-none',
        'bg-transparent text-inherit',
        fallbackClassName || className || 'h-full w-full',
      ].join(' ')}
    >
      {name?.[0]?.toUpperCase() || 'E'}
    </div>
  );
}

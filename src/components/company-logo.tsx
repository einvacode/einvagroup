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

  const derivedBrand = (name || 'Einva')
    .replace(/^(PT|CV|UD|PERUSAHAAN|COMPANY)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'E';

  return (
    <div
      className={[
        'flex items-center justify-center select-none text-slate-900',
        'bg-transparent leading-none',
        fallbackClassName || className || 'h-full w-full',
      ].join(' ')}
      aria-label={`Logo ${name || 'Perusahaan'}`}
    >
      <span className="text-[9px] font-bold tracking-[0.28em] uppercase opacity-75">PT</span>
      <span className="ml-1.5 text-base font-black tracking-[-0.08em] uppercase">{derivedBrand}</span>
    </div>
  );
}

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
        'flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm select-none',
        'leading-none text-blue-700',
        fallbackClassName || className || 'h-full w-full',
      ].join(' ')}
      aria-label={`Logo ${name || 'Perusahaan'}`}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-[7px] font-bold tracking-[0.28em] uppercase text-slate-500">PT</span>
        <span className="mt-0.5 text-[13px] font-black tracking-[-0.08em] uppercase text-blue-700">{derivedBrand}</span>
      </div>
    </div>
  );
}

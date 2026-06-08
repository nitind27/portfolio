'use client';

import Image from 'next/image';
import { APP_NAME, LOGO_SRC, brand } from '@/lib/brand';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Logo file is ~500×500 — square lockup (icon + SITE99 + tagline) */
const sizes: Record<Size, number> = {
  xs: 36,
  sm: 44,
  md: 52,
  lg: 72,
  xl: 92,
};

interface Props {
  size?: Size;
  className?: string;
  /** Light card behind logo — keeps navy wordmark readable on dark headers */
  pad?: boolean;
}

export default function BrandLogo({ size = 'md', className = '', pad = true }: Props) {
  const px = sizes[size];
  const padY = size === 'xs' ? 3 : size === 'sm' ? 4 : 5;
  const padX = size === 'xs' ? 6 : size === 'sm' ? 8 : 10;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={pad ? {
        background: 'linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%)',
        borderRadius: size === 'xs' ? 8 : 10,
        padding: `${padY}px ${padX}px`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px ${brand.accentGlow}`,
      } : undefined}
    >
      <Image
        src={LOGO_SRC}
        alt={APP_NAME}
        width={px}
        height={px}
        className="object-contain"
        style={{ width: px, height: px, display: 'block' }}
        priority
        unoptimized
      />
    </div>
  );
}

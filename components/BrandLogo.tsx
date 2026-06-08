'use client';

import Image from 'next/image';
import { APP_NAME, LOGO_SRC, brand } from '@/lib/brand';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const heights: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
};

interface Props {
  size?: Size;
  /** White pill behind logo — best on dark headers */
  onDark?: boolean;
  className?: string;
}

export default function BrandLogo({ size = 'md', onDark = true, className = '' }: Props) {
  const h = heights[size];

  return (
    <div
      className={`inline-flex items-center shrink-0 ${className}`}
      style={onDark ? {
        background: '#ffffff',
        borderRadius: 10,
        padding: size === 'xs' ? '4px 8px' : size === 'sm' ? '5px 10px' : '6px 12px',
        boxShadow: `0 1px 0 ${brand.border}, 0 4px 20px ${brand.accentGlow}`,
      } : undefined}
    >
      <Image
        src={LOGO_SRC}
        alt={APP_NAME}
        width={Math.round(h * 2.2)}
        height={h}
        className="object-contain object-left"
        style={{ height: h, width: 'auto', maxWidth: Math.round(h * 2.4) }}
        priority
      />
    </div>
  );
}

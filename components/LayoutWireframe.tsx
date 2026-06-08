'use client';

import { CSSProperties } from 'react';
import { LayoutPreset } from '@/lib/purpose-layouts';

const PREVIEW_STYLES: Record<string, CSSProperties> = {
  'hero-split': { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: '100%' },
  'hero-banner': { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', background: 'linear-gradient(180deg, transparent 30%, rgba(99,102,241,0.35))' },
  'hero-minimal': { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 6 },
  'hero-slideshow': { display: 'flex', gap: 3, height: '100%', alignItems: 'stretch' },
  'hero-split-full': { display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' },
  'hero-f-shape': { display: 'flex', flexDirection: 'column', height: '100%' },
  'hero-z-shape': { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', height: '100%' },
  'hero-holy-grail': { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', height: '100%', gap: 2 },
  'hero-grid-cards': { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' },
  'hero-asymmetrical': { display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', height: '100%' },
  'hero-magazine': { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(99,102,241,0.25) 100%)' },
  'hero-one-page': { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'linear-gradient(180deg, rgba(99,102,241,0.3), rgba(79,70,229,0.2))' },
};

function SectionBlocks({ variant }: { variant: 'default' | 'grid' | 'z' | 'f' | 'column' | 'magazine' }) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-3 gap-1 shrink-0">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-2 rounded bg-white/10" />
        ))}
      </div>
    );
  }
  if (variant === 'z') {
    return (
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex gap-1"><div className="flex-[2] h-2 rounded bg-white/10" /><div className="flex-1 h-2 rounded bg-white/6" /></div>
        <div className="flex gap-1"><div className="flex-1 h-2 rounded bg-white/6" /><div className="flex-[2] h-2 rounded bg-white/10" /></div>
      </div>
    );
  }
  if (variant === 'f') {
    return (
      <div className="flex flex-col gap-1 shrink-0">
        <div className="h-1.5 w-full rounded bg-white/12" />
        <div className="flex gap-1">
          <div className="flex-[2] h-2 rounded bg-white/10" />
          <div className="flex-1 h-2 rounded bg-white/6" />
        </div>
      </div>
    );
  }
  if (variant === 'column') {
    return (
      <div className="flex flex-col gap-1 shrink-0 items-center">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-2/3 h-1.5 rounded bg-white/8" />
        ))}
      </div>
    );
  }
  if (variant === 'magazine') {
    return (
      <div className="flex gap-1 shrink-0">
        <div className="flex-[2] h-3 rounded bg-white/10" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 rounded bg-white/8" />
          <div className="h-1.5 rounded bg-white/6" />
          <div className="h-1.5 rounded bg-white/6" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-1 shrink-0">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex-1 h-2 rounded bg-white/8" />
      ))}
    </div>
  );
}

const BLOCK_VARIANT: Record<string, 'default' | 'grid' | 'z' | 'f' | 'column' | 'magazine'> = {
  'hero-grid-cards': 'grid',
  'hero-z-shape': 'z',
  'hero-f-shape': 'f',
  'hero-minimal': 'column',
  'hero-one-page': 'column',
  'hero-magazine': 'magazine',
  'hero-holy-grail': 'grid',
};

export default function LayoutWireframe({ preset, active }: { preset: LayoutPreset; active?: boolean }) {
  const heroStyle = PREVIEW_STYLES[preset.preview] || PREVIEW_STYLES['hero-split'];
  const blockVariant = BLOCK_VARIANT[preset.preview] || 'default';

  return (
    <div className={`rounded-lg overflow-hidden border ${active ? 'border-blue-500' : 'border-white/15'} bg-[#0a0a0a]`} style={{ height: 88 }}>
      <div className="h-3 border-b border-white/10 flex items-center px-1.5 gap-0.5">
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="flex-1 mx-1 h-1.5 rounded bg-white/10" />
      </div>
      <div className="p-1.5 h-[calc(100%-12px)] flex flex-col gap-1">
        <div className="rounded overflow-hidden flex-1 min-h-0" style={heroStyle}>
          {preset.preview === 'hero-split' && (
            <>
              <div className="p-1.5 flex flex-col justify-center gap-1">
                <div className="h-1.5 w-3/4 rounded bg-white/30" />
                <div className="h-1 w-1/2 rounded bg-white/15" />
                <div className="h-2 w-8 rounded mt-1" style={{ background: 'rgba(99,102,241,0.6)' }} />
              </div>
              <div className="bg-white/10 m-1 rounded" />
            </>
          )}
          {preset.preview === 'hero-banner' && (
            <div className="p-2 text-center">
              <div className="h-1.5 w-2/3 mx-auto rounded bg-white/35 mb-1" />
              <div className="h-1 w-1/2 mx-auto rounded bg-white/15" />
            </div>
          )}
          {preset.preview === 'hero-minimal' && (
            <>
              <div className="h-2 w-2/3 rounded bg-white/30" />
              <div className="h-1 w-1/2 rounded bg-white/15" />
            </>
          )}
          {preset.preview === 'hero-slideshow' && (
            <>
              <div className="flex-[2] bg-white/12 m-0.5 rounded" />
              <div className="flex-1 bg-white/8 m-0.5 rounded" />
              <div className="flex-1 bg-white/8 m-0.5 rounded" />
            </>
          )}
          {preset.preview === 'hero-split-full' && (
            <>
              <div className="p-1.5 flex flex-col justify-center gap-1 bg-white/5">
                <div className="h-2 w-3/4 rounded bg-white/30" />
                <div className="h-1 w-1/2 rounded bg-white/15" />
              </div>
              <div className="bg-white/15" />
            </>
          )}
          {preset.preview === 'hero-f-shape' && (
            <>
              <div className="flex-1 p-1.5 flex flex-col justify-end">
                <div className="h-1.5 w-2/3 rounded bg-white/30" />
                <div className="h-1 w-1/3 rounded bg-white/15 mt-0.5" />
              </div>
              <div className="h-2 mx-1 mb-1 rounded bg-blue-500/40" />
            </>
          )}
          {preset.preview === 'hero-z-shape' && (
            <>
              <div className="p-1.5 flex flex-col justify-center gap-1">
                <div className="h-2 w-4/5 rounded bg-white/30" />
                <div className="h-1 w-1/2 rounded bg-white/15" />
              </div>
              <div className="bg-white/12 m-0.5 rounded" />
            </>
          )}
          {preset.preview === 'hero-holy-grail' && (
            <>
              <div className="bg-white/6 m-0.5 rounded" />
              <div className="bg-white/12 m-0.5 rounded flex flex-col justify-center p-1 gap-0.5">
                <div className="h-1 w-3/4 rounded bg-white/25" />
                <div className="h-1 w-1/2 rounded bg-white/12" />
              </div>
              <div className="bg-white/6 m-0.5 rounded" />
            </>
          )}
          {preset.preview === 'hero-grid-cards' && (
            <div className="p-2 text-center">
              <div className="h-1.5 w-1/2 mx-auto rounded bg-white/35 mb-1" />
              <div className="h-1 w-1/3 mx-auto rounded bg-white/15" />
            </div>
          )}
          {preset.preview === 'hero-asymmetrical' && (
            <>
              <div className="p-1.5 flex flex-col justify-center gap-1">
                <div className="h-2.5 w-4/5 rounded bg-white/35" />
                <div className="h-1 w-2/3 rounded bg-white/15" />
              </div>
              <div className="bg-white/10 m-0.5 rounded" />
            </>
          )}
          {preset.preview === 'hero-magazine' && (
            <div className="p-2">
              <div className="h-1 w-1/4 rounded bg-white/20 mb-1" />
              <div className="h-2 w-3/4 rounded bg-white/35" />
            </div>
          )}
          {preset.preview === 'hero-one-page' && (
            <>
              <div className="h-2 w-3/5 rounded bg-white/35" />
              <div className="h-1 w-2/5 rounded bg-white/15" />
              <div className="h-2 w-10 rounded mt-1" style={{ background: 'rgba(99,102,241,0.55)' }} />
            </>
          )}
        </div>
        <SectionBlocks variant={blockVariant} />
      </div>
    </div>
  );
}

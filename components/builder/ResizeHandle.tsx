'use client';

import { useCallback } from 'react';

interface Props {
  side: 'left' | 'right';
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

export default function ResizeHandle({ side, onResize, onResizeEnd }: Props) {
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    let lastX = e.clientX;

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - lastX;
      lastX = ev.clientX;
      onResize(side === 'left' ? delta : -delta);
    };

    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      onResizeEnd?.();
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [side, onResize, onResizeEnd]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      onPointerDown={onPointerDown}
      className={`hidden lg:block absolute top-0 bottom-0 z-30 w-2 cursor-col-resize touch-none select-none group ${
        side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
      }`}
    >
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-transparent group-hover:bg-blue-500/50 group-active:bg-blue-500 transition-colors" />
    </div>
  );
}

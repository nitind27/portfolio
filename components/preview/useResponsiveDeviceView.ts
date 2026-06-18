'use client';

import { useEffect, useState } from 'react';
import { viewportWidthToDeviceView, type DeviceView } from '@/lib/responsive';

/** Live viewport breakpoints for public portfolio pages. Pass `simulated` from the builder to lock desktop/tablet/mobile preview. */
export function useResponsiveDeviceView(simulated?: DeviceView): DeviceView {
  const [live, setLive] = useState<DeviceView>(simulated ?? 'mobile');

  useEffect(() => {
    if (simulated !== undefined) return;
    const sync = () => setLive(viewportWidthToDeviceView(window.innerWidth));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [simulated]);

  return simulated ?? live;
}

import { ThemeConfig } from './types';

export type DeviceView = 'desktop' | 'tablet' | 'mobile';

export function isMobileDeviceView(deviceView?: DeviceView): boolean {
  return deviceView === 'mobile';
}

export function isNarrowDeviceView(deviceView?: DeviceView): boolean {
  return deviceView === 'mobile' || deviceView === 'tablet';
}

const DESKTOP_PAD: Record<string, string> = { compact: '3rem', normal: '5rem', relaxed: '8rem' };
const MOBILE_PAD: Record<string, string> = { compact: '2rem', normal: '2.5rem', relaxed: '3.25rem' };

export function getSectionPad(spacing: ThemeConfig['spacing'], narrow: boolean): string {
  const map = narrow ? MOBILE_PAD : DESKTOP_PAD;
  return map[spacing] || (narrow ? '2.5rem' : '5rem');
}

/** Map browser width to builder device breakpoints (public /p/ pages). */
export function viewportWidthToDeviceView(width: number): DeviceView {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

const DEVICE_VIEW_RANK: Record<DeviceView, number> = { mobile: 0, tablet: 1, desktop: 2 };

/** Use the narrower of simulated builder view and actual preview width (fixes desktop nav on a phone-sized frame). */
export function clampDeviceViewToWidth(simulated: DeviceView, width: number): DeviceView {
  if (width <= 0) return simulated;
  const byWidth = viewportWidthToDeviceView(width);
  return DEVICE_VIEW_RANK[byWidth] < DEVICE_VIEW_RANK[simulated] ? byWidth : simulated;
}

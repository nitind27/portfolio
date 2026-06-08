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

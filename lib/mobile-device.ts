/** Detect phones / small mobile browsers (not desktop). */
export function isMobileUserAgent(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
}

/** iPad and Android tablets — optional desktop-style experience. */
export function isTabletUserAgent(userAgent: string): boolean {
  return /iPad|Tablet|PlayBook|Silk/i.test(userAgent)
    || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent));
}

export function shouldRecommendDesktop(userAgent: string): boolean {
  return isMobileUserAgent(userAgent) && !isTabletUserAgent(userAgent);
}

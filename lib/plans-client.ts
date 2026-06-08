import type { PlanFeatures, SubscriptionPlan } from './plans-types';

export interface PlansConfigResponse {
  plans: SubscriptionPlan[];
  userPlan: SubscriptionPlan;
  features: PlanFeatures;
  templates: { id: string; name: string; category: string; locked: boolean; minPlanName: string | null }[];
}

let cachedConfig: PlansConfigResponse | null = null;
let cacheTime = 0;

export async function fetchPlansConfig(force = false): Promise<PlansConfigResponse | null> {
  if (!force && cachedConfig && Date.now() - cacheTime < 60_000) return cachedConfig;
  try {
    const res = await fetch('/api/plans/config');
    if (!res.ok) return null;
    const data = await res.json();
    cachedConfig = data;
    cacheTime = Date.now();
    return data;
  } catch {
    return null;
  }
}

export function invalidatePlansCache() {
  cachedConfig = null;
  cacheTime = 0;
}

export function templateIsLocked(config: PlansConfigResponse | null, templateId: string): boolean {
  if (!config) return false;
  const t = config.templates.find(x => x.id === templateId);
  return t?.locked ?? false;
}

export function featureEnabled(config: PlansConfigResponse | null, key: keyof PlanFeatures): boolean {
  if (!config) return true;
  const v = config.features[key];
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v > 0;
  return false;
}

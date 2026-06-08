import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import {
  getAllPlans,
  getUserPlan,
  getUserFeatures,
  getTemplateRules,
  ensureTemplateRulesSeeded,
} from '@/lib/plans-server';
import { TEMPLATES } from '@/lib/templates';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    await ensureTemplateRulesSeeded();
    const [plans, userPlan, features, templateRules] = await Promise.all([
      getAllPlans(true),
      getUserPlan(user),
      getUserFeatures(user),
      getTemplateRules(),
    ]);

    const templates = TEMPLATES.map(t => {
      const rule = templateRules.find(r => r.templateId === t.id);
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        minPlanId: rule?.minPlanId ?? null,
        minPlanName: rule?.minPlanName ?? null,
        locked: rule?.minPlanId != null && userPlan.tier < (plans.find(p => p.id === rule.minPlanId)?.tier ?? 999),
      };
    });

    return NextResponse.json({
      plans,
      userPlan,
      features,
      templateRules,
      templates,
    });
  } catch (err) {
    console.error('Plans config error:', err);
    return NextResponse.json({ error: 'Could not load plan config' }, { status: 500 });
  }
}

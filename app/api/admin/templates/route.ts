import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/admin-server';
import { getTemplateRules, updateTemplateRule, ensureTemplateRulesSeeded } from '@/lib/plans-server';
import { TEMPLATES } from '@/lib/templates';
import { CATEGORY_LABELS } from '@/lib/website-purposes';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureTemplateRulesSeeded();
    const rules = await getTemplateRules();
    const ruleMap = new Map(rules.map(r => [r.templateId, r]));

    const templates = TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      categoryLabel: CATEGORY_LABELS[t.category] || t.category,
      description: t.description,
      minPlanId: ruleMap.get(t.id)?.minPlanId ?? null,
      minPlanName: ruleMap.get(t.id)?.minPlanName ?? null,
    }));

    return NextResponse.json({ templates });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const templateId = String(body.templateId || '');
    const minPlanId = body.minPlanId === null || body.minPlanId === '' ? null : Number(body.minPlanId);
    if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    await updateTemplateRule(templateId, minPlanId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const updates: { templateId: string; minPlanId: number | null }[] = body.updates || [];
    for (const u of updates) {
      await updateTemplateRule(u.templateId, u.minPlanId);
    }
    return NextResponse.json({ ok: true, count: updates.length });
  } catch (err) {
    const { status, body } = adminErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

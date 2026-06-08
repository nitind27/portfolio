import { PortfolioSection, SectionField, TeamMemberBlock } from './types';

export function genTeamMemberId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createEmptyTeamMember(): TeamMemberBlock {
  return { id: genTeamMemberId(), name: '', role: '', bio: '', image: '', linkedin: '', twitter: '', email: '' };
}

export function parseLegacyTeamMember(raw: string): TeamMemberBlock {
  const [name, role] = raw.includes(' - ')
    ? raw.split(' - ').map(s => s.trim())
    : [raw.trim(), ''];
  return {
    id: genTeamMemberId(),
    name: name || 'Team Member',
    role: role || '',
    bio: '',
    image: '',
    linkedin: '',
    twitter: '',
    email: '',
  };
}

export function getTeamMembersFromSection(section: PortfolioSection): TeamMemberBlock[] {
  const field = section.fields.find(f => f.id === 'teamitems');
  if (field?.type === 'teamitems' && Array.isArray(field.value)) {
    return field.value as TeamMemberBlock[];
  }
  const legacy = section.fields.find(f => f.id === 'members');
  if (legacy && Array.isArray(legacy.value)) {
    return (legacy.value as string[]).map(parseLegacyTeamMember);
  }
  return [];
}

export function migrateTeamSection(section: PortfolioSection): PortfolioSection {
  if (section.type !== 'team') return section;
  if (section.fields.some(f => f.id === 'teamitems')) {
    return {
      ...section,
      fields: section.fields.filter(f => f.id !== 'members'),
    };
  }

  const legacy = section.fields.find(f => f.id === 'members');
  const items: TeamMemberBlock[] = legacy && Array.isArray(legacy.value)
    ? (legacy.value as string[]).map(parseLegacyTeamMember)
    : [createEmptyTeamMember()];

  const fieldsWithoutLegacy = section.fields.filter(f => f.id !== 'members');
  const hasSubtitle = fieldsWithoutLegacy.some(f => f.id === 'subtitle');
  const withSubtitle = hasSubtitle
    ? fieldsWithoutLegacy
    : [...fieldsWithoutLegacy, { id: 'subtitle', label: 'Subtitle', type: 'text' as const, value: 'The people behind the work' }];

  const teamField: SectionField = {
    id: 'teamitems', label: 'Team Members', type: 'teamitems', value: items,
  };

  return { ...section, fields: [...withSubtitle.filter(f => f.id !== 'teamitems'), teamField] };
}

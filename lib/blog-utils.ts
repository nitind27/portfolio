import { BlogPostBlock, PortfolioSection, SectionField } from './types';

export function genBlogId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createEmptyBlogPost(): BlogPostBlock {
  return {
    id: genBlogId(),
    title: '',
    date: '',
    summary: '',
    body: '',
    image: '',
    link: '',
    linkLabel: 'Read more',
    list: [],
  };
}

export function parseLegacyBlogPost(raw: string): BlogPostBlock {
  const parts = raw.split('|').map(s => s.trim());
  if (parts.length >= 4) {
    return {
      id: genBlogId(),
      title: parts[0],
      date: parts[1],
      summary: parts[2],
      body: parts.slice(3).join('|').trim(),
      image: '',
      link: '',
      linkLabel: 'Read more',
      list: [],
    };
  }
  if (parts.length === 3) {
    return { id: genBlogId(), title: parts[0], date: parts[1], summary: parts[2], body: parts[2], image: '', link: '', linkLabel: 'Read more', list: [] };
  }
  return { id: genBlogId(), title: raw, date: '', summary: '', body: raw, image: '', link: '', linkLabel: 'Read more', list: [] };
}

export function getBlogPostsFromSection(section: PortfolioSection): BlogPostBlock[] {
  const blogField = section.fields.find(f => f.id === 'blogposts');
  if (blogField?.type === 'blogposts' && Array.isArray(blogField.value)) {
    return blogField.value as BlogPostBlock[];
  }
  const legacy = section.fields.find(f => f.id === 'posts');
  if (legacy && Array.isArray(legacy.value)) {
    return (legacy.value as string[]).map(parseLegacyBlogPost);
  }
  return [];
}

export function migrateBlogSection(section: PortfolioSection): PortfolioSection {
  if (section.type !== 'blog') return section;
  if (section.fields.some(f => f.id === 'blogposts')) return section;

  const legacyPosts = section.fields.find(f => f.id === 'posts');
  const posts: BlogPostBlock[] = legacyPosts && Array.isArray(legacyPosts.value)
    ? (legacyPosts.value as string[]).map(parseLegacyBlogPost)
    : [createEmptyBlogPost()];

  const fieldsWithoutPosts = section.fields.filter(f => f.id !== 'posts');
  const blogpostsField: SectionField = { id: 'blogposts', label: 'Blog Posts', type: 'blogposts', value: posts };

  return { ...section, fields: [...fieldsWithoutPosts, blogpostsField] };
}

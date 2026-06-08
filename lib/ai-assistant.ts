import { SITE_DOCS, type DocSection } from './site-knowledge';
import { APP_NAME } from './brand';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function scoreDoc(doc: DocSection, queryTokens: string[]): number {
  let score = 0;
  const titleTokens = tokenize(doc.title);
  const keywordSet = new Set(doc.keywords.map(k => k.toLowerCase()));
  const bodyTokens = new Set(tokenize(doc.body + ' ' + doc.summary));

  for (const token of queryTokens) {
    if (keywordSet.has(token)) score += 12;
    if (titleTokens.includes(token)) score += 8;
    if (bodyTokens.has(token)) score += 2;
    for (const kw of doc.keywords) {
      if (kw.toLowerCase().includes(token)) score += 6;
    }
  }

  if (queryTokens.some(t => doc.id.includes(t))) score += 5;
  return score;
}

export function searchKnowledge(query: string, limit = 4): DocSection[] {
  const q = query.trim();
  if (!q) return SITE_DOCS.slice(0, limit);

  const tokens = tokenize(q);
  if (tokens.length === 0) return SITE_DOCS.slice(0, limit);

  return [...SITE_DOCS]
    .map(doc => ({ doc, score: scoreDoc(doc, tokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.doc);
}

export function buildAssistantReply(query: string, docs: DocSection[]): {
  answer: string;
  sources: { id: string; title: string }[];
} {
  if (docs.length === 0) {
    return {
      answer: `I couldn't find specific docs for that. Try asking about **Sections**, **Theme**, **Popup**, **SEO**, **SMTP**, **Social**, **Share**, **Export**, **Billing**, or **Refund policy**. Or browse the full [Documentation](/docs).`,
      sources: [],
    };
  }

  const primary = docs[0];
  const related = docs.slice(1, 3);

  let answer = `**${primary.title}**\n\n${primary.body}`;

  if (related.length) {
    answer += '\n\n**Related:**\n';
    for (const r of related) {
      answer += `• ${r.title} — ${r.summary}\n`;
    }
  }

  answer += `\n\n— ${APP_NAME} Assistant · [Read full docs](/docs#${primary.id})`;

  return {
    answer,
    sources: docs.map(d => ({ id: d.id, title: d.title })),
  };
}

export async function generateAiReply(query: string): Promise<{
  answer: string;
  sources: { id: string; title: string }[];
}> {
  const docs = searchKnowledge(query, 4);
  const local = buildAssistantReply(query, docs);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return local;

  try {
    const context = docs.map(d => `## ${d.title}\n${d.body}`).join('\n\n');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: `You are ${APP_NAME} support assistant. Answer ONLY from the documentation context. Be clear, friendly, use markdown. Mention refund policy: NO REFUNDS on premium purchases. If unsure, say so and link to /docs.`,
          },
          { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
        ],
      }),
    });

    if (!res.ok) return local;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return local;

    return { answer: content, sources: docs.map(d => ({ id: d.id, title: d.title })) };
  } catch {
    return local;
  }
}

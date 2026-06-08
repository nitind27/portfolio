'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Send, Loader2, Sparkles, User, BookOpen } from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import { SUGGESTED_AI_QUESTIONS } from '@/lib/site-knowledge';
import { APP_NAME, brand } from '@/lib/brand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { id: string; title: string }[];
}

function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-orange-400 hover:underline">$1</a>');
      if (line.startsWith('• ')) {
        return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: html.slice(2) }} />;
      }
      return <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
    });
}

export default function AskAiPageClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm the **${APP_NAME} Assistant**. Ask me anything about the builder — Sections, Theme, Popup, Social, SEO, SMTP, sharing, export, billing, or refund policy.\n\nI answer from our official documentation.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(m => [...m, { role: 'assistant', content: data.answer, sources: data.sources }]);
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Sorry, I could not answer right now. Please browse the [Documentation](/docs) or try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingShell
      title="Ask AI"
      subtitle="Get instant answers about every builder feature, plan, and policy."
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <div
          className="rounded-2xl border overflow-hidden flex flex-col"
          style={{ borderColor: brand.border, background: brand.surface, height: 'min(70vh, 640px)' }}
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: brand.border, background: brand.navy }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: brand.accentMuted }}>
              <Bot className="w-5 h-5" style={{ color: brand.accent }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{APP_NAME} Assistant</p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Powered by site documentation</p>
            </div>
            <Link href="/docs" className="ml-auto text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Full docs
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600/20' : ''}`}
                  style={msg.role === 'assistant' ? { background: brand.accentMuted } : undefined}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4 text-blue-400" /> : <Bot className="w-4 h-4" style={{ color: brand.accent }} />}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-blue-600/20 text-blue-100' : 'bg-white/[0.04] text-gray-300'
                  }`}
                >
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1">
                      {msg.sources.map(s => (
                        <Link key={s.id} href={`/docs#${s.id}`} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-orange-300 hover:bg-white/10">
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: brand.accentMuted }}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: brand.accent }} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/[0.04] text-sm text-gray-500">Thinking…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t space-y-3" style={{ borderColor: brand.border }}>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_AI_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about Popup, SEO, SMTP, billing, refunds…"
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-3 rounded-xl text-white disabled:opacity-50 flex items-center gap-2 font-medium text-sm"
                style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}

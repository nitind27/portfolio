'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Send, Loader2, Sparkles, X, ChevronDown, ChevronUp, Map, Lightbulb, PlayCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { getBuilderHelp, BUILDER_FEATURE_MAP, type HelpTip } from '@/lib/builder-help';
import type { RightTab } from '../Builder';
import type { SectionType } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { id: string; title: string }[];
}

interface Props {
  rightTab: RightTab;
  activeSectionType?: SectionType;
  activeSectionTitle?: string;
  previewMode: boolean;
  sectionCount: number;
  variant?: 'inline' | 'drawer';
  onClose?: () => void;
  onShowTour?: () => void;
  onNavigateTab?: (tab: RightTab) => void;
}

function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>');
      if (line.startsWith('• ')) {
        return <li key={i} className="ml-4 list-disc text-gray-400" dangerouslySetInnerHTML={{ __html: html.slice(2) }} />;
      }
      return <p key={i} className="mb-1.5 last:mb-0 text-gray-400" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
    });
}

function TipList({ tips }: { tips: HelpTip[] }) {
  return (
    <div className="space-y-2">
      {tips.map((tip, i) => (
        <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition">
          <span className="text-base shrink-0 mt-0.5">{tip.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-200">{tip.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tip.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BuilderHelpPanel({
  rightTab,
  activeSectionType,
  activeSectionTitle,
  previewMode,
  sectionCount,
  variant = 'inline',
  onClose,
  onShowTour,
  onNavigateTab,
}: Props) {
  const help = getBuilderHelp({ rightTab, activeSectionType, activeSectionTitle, previewMode, sectionCount });
  const [showAi, setShowAi] = useState(variant === 'drawer');
  const [showQuickStart, setShowQuickStart] = useState(variant === 'inline' && !activeSectionType);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Need help? I know every builder feature. Tap a suggestion below or ask anything about **Sections**, **Theme**, **Share**, **Export**, and more.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showAi]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    setShowAi(true);
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
        content: 'Sorry, I could not answer right now. Try the [Documentation](/docs) or ask again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const isDrawer = variant === 'drawer';

  return (
    <div className={`flex flex-col ${isDrawer ? 'h-full' : ''}`}>
      {isDrawer && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Builder Guide</p>
              <p className="text-[10px] text-gray-500">Tips + AI assistant</p>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${isDrawer ? 'p-4 space-y-4' : 'p-4 space-y-4'}`}>
        {!isDrawer && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-600/10 border border-blue-500/25">
            <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-300">How to edit your site</p>
              <p className="text-[11px] text-blue-200/70 mt-0.5 leading-relaxed">
                Click any section on the left or preview → edit fields here. Use top tabs for theme, navbar, SEO & more.
              </p>
            </div>
          </div>
        )}

        {onShowTour && (
          <button
            type="button"
            onClick={onShowTour}
            className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition text-left"
          >
            <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Take the guided tour</p>
              <p className="text-[10px] text-gray-500">Walk through every part of the builder (~1 min)</p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowQuickStart(v => !v)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5" /> Quick start (4 steps)
          </span>
          {showQuickStart ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
        </button>
        {showQuickStart && <TipList tips={help.quickStart} />}

        {!activeSectionType && rightTab === 'sections' && onNavigateTab && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">All features (top bar)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {BUILDER_FEATURE_MAP.map(f => (
                <button
                  key={f.tab}
                  type="button"
                  onClick={() => onNavigateTab(f.tab)}
                  className={`text-left p-2 rounded-lg border transition ${
                    rightTab === f.tab
                      ? 'border-blue-500/40 bg-blue-600/10'
                      : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15'
                  }`}
                >
                  <span className="text-sm">{f.icon}</span>
                  <p className="text-[11px] font-medium text-gray-300 mt-0.5">{f.label}</p>
                  <p className="text-[10px] text-gray-600">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{help.headline}</p>
          <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{help.intro}</p>
          <TipList tips={help.tips} />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAi(v => !v)}
            className="w-full flex items-center justify-between gap-2 mb-2"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Ask AI
            </span>
            {showAi ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
          </button>

          {showAi && (
            <div className={`rounded-xl border border-white/10 overflow-hidden ${isDrawer ? '' : 'bg-[#0a0a0a]'}`}>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] text-gray-500">{APP_NAME} Assistant · answers from docs</p>
              </div>

              <div className={`overflow-y-auto p-3 space-y-3 ${isDrawer ? 'max-h-52' : 'max-h-44'}`}>
                {messages.map((msg, i) => (
                  <div key={i} className={`text-[11px] leading-relaxed ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[95%] rounded-xl px-3 py-2 ${
                      msg.role === 'user' ? 'bg-blue-600/20 text-blue-200' : 'bg-white/[0.04] text-gray-400'
                    }`}>
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1 justify-start">
                        {msg.sources.map(s => (
                          <Link key={s.id} href={`/docs#${s.id}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-blue-300 hover:bg-white/10">
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-2.5 border-t border-white/10 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {help.suggestedQuestions.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      disabled={loading}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-1.5">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask anything about the builder…"
                    disabled={loading}
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-[11px] bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <Link href="/docs" className="block text-center text-[10px] text-gray-600 hover:text-gray-400 transition py-1">
          Browse full documentation →
        </Link>
      </div>
    </div>
  );
}

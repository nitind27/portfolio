'use client';
import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { PopupConfig, ThemeConfig } from '@/lib/types';

interface Props {
  popup: PopupConfig;
  theme: ThemeConfig;
  onDismiss?: () => void;
  compact?: boolean;
  showClose?: boolean;
}

export default function PopupCard({ popup, theme, onDismiss, compact, showClose = true }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const titleSize = compact ? '1rem' : '1.5rem';
  const bodySize = compact ? '0.75rem' : '0.95rem';
  const pad = compact ? '1.25rem 1rem' : '2.5rem 2rem';
  const iconSize = compact ? 36 : 52;

  return (
    <div
      style={{
        background: popup.bgColor,
        color: popup.textColor,
        borderRadius: compact ? 14 : 20,
        width: '100%',
        padding: pad,
        position: 'relative',
        boxShadow: compact ? '0 8px 32px rgba(0,0,0,0.35)' : '0 32px 80px rgba(0,0,0,0.5)',
      }}
    >
      {showClose && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            position: 'absolute', top: compact ? 8 : 14, right: compact ? 8 : 14,
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: compact ? 26 : 32, height: compact ? 26 : 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: popup.textColor, transition: 'background 0.2s',
          }}
        >
          <X size={compact ? 12 : 16} />
        </button>
      )}

      {popup.type === 'email-capture' && (
        <div style={{
          width: iconSize, height: iconSize, borderRadius: '50%', background: theme.primaryColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: compact ? '0 auto 0.75rem' : '0 auto 1.25rem',
        }}>
          <Mail size={compact ? 16 : 24} color="#fff" />
        </div>
      )}
      {popup.type === 'announcement' && (
        <div style={{ fontSize: compact ? '1.25rem' : '2rem', textAlign: 'center', marginBottom: compact ? '0.5rem' : '1rem' }}>📢</div>
      )}

      <h3 style={{
        fontSize: titleSize, fontWeight: 700, marginBottom: compact ? '0.4rem' : '0.75rem',
        textAlign: popup.type !== 'message' ? 'center' : 'left',
      }}>
        {popup.title || 'Popup Title'}
      </h3>
      <p style={{
        opacity: 0.8, lineHeight: 1.65, marginBottom: compact ? '1rem' : '1.75rem',
        fontSize: bodySize, textAlign: popup.type !== 'message' ? 'center' : 'left',
      }}>
        {popup.message || 'Your popup message goes here.'}
      </p>

      {popup.type === 'email-capture' && !submitted ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: compact ? 'column' : 'row' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              flex: 1, padding: compact ? '0.5rem 0.75rem' : '0.65rem 1rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
              color: popup.textColor, outline: 'none', fontSize: compact ? '0.75rem' : '0.9rem',
            }}
          />
          <button
            type="button"
            onClick={() => { if (email) setSubmitted(true); }}
            style={{
              background: theme.primaryColor, color: '#fff',
              padding: compact ? '0.5rem 0.75rem' : '0.65rem 1.25rem',
              borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600,
              fontSize: compact ? '0.75rem' : '0.9rem', whiteSpace: 'nowrap',
            }}
          >
            Subscribe
          </button>
        </div>
      ) : popup.type === 'email-capture' && submitted ? (
        <p style={{ textAlign: 'center', color: theme.primaryColor, fontWeight: 600, fontSize: compact ? '0.8rem' : '1rem' }}>
          Thanks for subscribing!
        </p>
      ) : (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            width: '100%', background: theme.primaryColor, color: '#fff',
            padding: compact ? '0.6rem' : '0.85rem', borderRadius: 12, border: 'none',
            cursor: 'pointer', fontWeight: 600, fontSize: compact ? '0.8rem' : '1rem',
          }}
        >
          {popup.buttonText || 'Got it!'}
        </button>
      )}
    </div>
  );
}

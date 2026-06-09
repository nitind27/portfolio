'use client';

import { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { Mail, Lock, User, Phone, Loader2, Eye, EyeOff, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { brand, STORAGE_POLICY_DAYS } from '@/lib/brand';

export type AuthMode = 'login' | 'register';

const REMEMBER_KEY = 'site99_remember';
const EMAIL_KEY = 'site99_saved_email';
const GOOGLE_AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

function GoogleSignInButton() {
  if (!GOOGLE_AUTH_ENABLED) return null;

  return (
    <>
      <a
        href="/api/auth/google"
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-semibold border transition hover:bg-white/[0.06] active:scale-[0.99]"
        style={{ borderColor: brand.border, background: 'rgba(255,255,255,0.03)', color: brand.text }}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </a>
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: brand.border }} />
        <span className="text-[10px] text-gray-600 uppercase tracking-wide">or use email</span>
        <div className="flex-1 h-px" style={{ background: brand.border }} />
      </div>
    </>
  );
}

const INPUT_CLS =
  'w-full bg-[#0a1628] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition';

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        className={`${INPUT_CLS} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-white transition rounded-md"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

interface AuthFormProps {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onClose?: () => void;
  compact?: boolean;
  formId: string;
  onSubmitState?: (state: { loading: boolean; error: string }) => void;
  initialError?: string;
  showGoogleInline?: boolean;
  adminOnly?: boolean;
}

function AuthForm({ mode, setMode, onClose, compact, formId, onSubmitState, initialError, showGoogleInline = false, adminOnly = false }: AuthFormProps) {
  const { login, register, isAuthenticated } = useBuilderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) onClose?.();
  }, [isAuthenticated, onClose]);

  useEffect(() => {
    try {
      if (localStorage.getItem(REMEMBER_KEY) === '1') {
        setRememberMe(true);
        const saved = localStorage.getItem(EMAIL_KEY);
        if (saved) setEmail(saved);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    onSubmitState?.({ loading, error: error || initialError || '' });
  }, [loading, error, initialError, onSubmitState]);

  const resetErrors = () => setError('');

  const persistRememberMe = (checked: boolean, emailValue: string) => {
    try {
      if (checked) {
        localStorage.setItem(REMEMBER_KEY, '1');
        localStorage.setItem(EMAIL_KEY, emailValue.trim().toLowerCase());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(EMAIL_KEY);
      }
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      const result = await register({ name, email, phone, password });
      if (!result.ok) setError(result.error || 'Registration failed');
    } else {
      const result = await login(email, password, rememberMe, adminOnly);
      if (!result.ok) setError(result.error || 'Login failed');
      else persistRememberMe(rememberMe, email);
    }
    setLoading(false);
  };

  return (
    <>
      {showGoogleInline && !adminOnly && <GoogleSignInButton />}

      {!adminOnly && (
        <div
          className="flex p-1 rounded-xl mb-4"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${brand.border}` }}
        >
          {(['login', 'register'] as AuthMode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); resetErrors(); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === m ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
              }`}
              style={
                mode === m
                  ? { background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})` }
                  : undefined
              }
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>
      )}

      <form id={formId} onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); resetErrors(); }}
                placeholder="Your name"
                required
                className={INPUT_CLS}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); resetErrors(); }}
              placeholder="you@email.com"
              required
              autoComplete="email"
              className={INPUT_CLS}
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); resetErrors(); }}
                placeholder="10-digit mobile number"
                required
                className={INPUT_CLS}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Password</label>
          <PasswordInput
            value={password}
            onChange={v => { setPassword(v); resetErrors(); }}
            placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Confirm password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={v => { setConfirmPassword(v); resetErrors(); }}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
        )}

        {mode === 'login' && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => {
                const checked = e.target.checked;
                setRememberMe(checked);
                if (!checked) persistRememberMe(false, '');
              }}
              className="w-4 h-4 rounded border-white/20 bg-[#0a1628] accent-orange-500 cursor-pointer"
            />
            <span className="text-xs text-gray-400">Remember me for 30 days</span>
          </label>
        )}

        {!compact && (
          <>
            {error && (
              <div className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 disabled:opacity-60 font-bold py-3 rounded-xl text-sm transition-all hover:brightness-110 active:scale-[0.99]"
              style={{
                background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`,
                color: brand.onAccent,
                boxShadow: `0 8px 24px ${brand.accentGlow}`,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
                </>
              ) : mode === 'login' ? (
                adminOnly ? 'Sign in' : 'Sign in to your account'
              ) : (
                'Create free account'
              )}
            </button>
            {!adminOnly && (
              <p className="text-center text-[10px] text-gray-600 leading-relaxed">
                Free plan: {STORAGE_POLICY_DAYS}-day build & share · Premium from ₹{process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99}
              </p>
            )}
          </>
        )}
      </form>
    </>
  );
}

interface LoginPageProps {
  variant?: 'page' | 'modal';
  onClose?: () => void;
  initialMode?: AuthMode;
}

export default function LoginPage({ variant = 'page', onClose, initialMode = 'login' }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const formId = useId();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (variant === 'modal') {
    return <AuthForm mode={mode} setMode={setMode} onClose={onClose} compact formId={formId} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: brand.bg }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] rounded-2xl border overflow-hidden shadow-2xl"
        style={{ borderColor: brand.border, background: brand.surface }}
      >
        <AuthCardHeader mode={mode} onClose={undefined} showClose={false} />
        <div className="p-6">
          <AuthForm mode={mode} setMode={setMode} onClose={onClose} formId={formId} showGoogleInline={GOOGLE_AUTH_ENABLED} />
        </div>
      </motion.div>
    </div>
  );
}

function AuthCardHeader({
  mode,
  onClose,
  showClose = true,
  adminOnly = false,
}: {
  mode: AuthMode;
  onClose?: () => void;
  showClose?: boolean;
  adminOnly?: boolean;
}) {
  return (
    <div
      className="relative px-6 pt-5 pb-4 border-b shrink-0"
      style={{
        borderColor: brand.border,
        background: `linear-gradient(145deg, rgba(242,140,40,0.18) 0%, ${brand.navy} 45%, ${brand.surface} 100%)`,
      }}
    >
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition border border-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col items-center text-center pr-0">
        <BrandLogo size="sm" pad className="mb-3" />
        <h2 id="auth-modal-title" className="text-xl font-bold text-white leading-tight">
          {adminOnly ? 'Sign in' : mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
          {adminOnly
            ? 'Authorized staff only'
            : mode === 'login'
              ? 'Sign in to access your projects and builder'
              : 'Start building your website in minutes — free'}
        </p>
      </div>
    </div>
  );
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  initialError?: string;
  adminOnly?: boolean;
}

export function AuthModal({ open, onClose, initialMode = 'login', initialError = '', adminOnly = false }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [submitState, setSubmitState] = useState({ loading: false, error: '' });
  const formId = useId();

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setSubmitState({ loading: false, error: '' });
    }
  }, [open, initialMode]);

  useEffect(() => {
    setSubmitState(s => ({ ...s, error: '' }));
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const submitLabel = adminOnly
    ? 'Sign in'
    : mode === 'login'
      ? 'Sign in to your account'
      : 'Create free account';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#020810]/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px] rounded-2xl border overflow-hidden shadow-2xl shadow-black/50"
            style={{ borderColor: `${brand.accent}33`, background: brand.surface }}
            onClick={e => e.stopPropagation()}
          >
            <AuthCardHeader mode={mode} onClose={onClose} showClose={!adminOnly} adminOnly={adminOnly} />

            <div
              className={`px-6 pt-4 pb-2 ${mode === 'register' && !adminOnly ? 'max-h-[min(42vh,340px)] overflow-y-auto no-scrollbar' : ''}`}
            >
              <AuthForm
                mode={mode}
                setMode={setMode}
                onClose={onClose}
                compact
                formId={formId}
                onSubmitState={setSubmitState}
                initialError={initialError}
                showGoogleInline={GOOGLE_AUTH_ENABLED}
                adminOnly={adminOnly}
              />
            </div>

            <div
              className="px-6 pt-3 pb-4 border-t space-y-2.5"
              style={{ borderColor: brand.border, background: 'rgba(0,0,0,0.15)' }}
            >
              {submitState.error && (
                <div className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                  {submitState.error}
                </div>
              )}
              <button
                type="submit"
                form={formId}
                disabled={submitState.loading}
                className="w-full flex items-center justify-center gap-2 disabled:opacity-60 font-bold py-3 rounded-xl text-sm transition-all hover:brightness-110 active:scale-[0.99]"
                style={{
                  background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentHover})`,
                  color: brand.onAccent,
                  boxShadow: `0 8px 24px ${brand.accentGlow}`,
                }}
              >
                {submitState.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>

            {!adminOnly && (
              <div
                className="px-6 py-2.5 border-t text-center"
                style={{ borderColor: brand.border, background: 'rgba(0,0,0,0.25)' }}
              >
                <p className="text-[10px] text-gray-600">
                  By continuing you agree to our{' '}
                  <a href="/privacy" className="text-orange-400/80 hover:text-orange-300 underline-offset-2 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

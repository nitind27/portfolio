'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { brand, STORAGE_POLICY_DAYS } from '@/lib/brand';

type Mode = 'login' | 'register';

const REMEMBER_KEY = 'site99_remember';
const EMAIL_KEY = 'site99_saved_email';

function PasswordInput({
  value,
  onChange,
  placeholder,
  inputCls,
  autoComplete = 'current-password',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputCls: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        className={`${inputCls} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#64748b] hover:text-white transition rounded-md"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, register } = useBuilderStore();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(REMEMBER_KEY) === '1') {
        const savedEmail = localStorage.getItem(EMAIL_KEY);
        setRememberMe(true);
        if (savedEmail) setEmail(savedEmail);
      }
    } catch { /* ignore */ }
  }, []);

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
      const result = await login(email, password, rememberMe);
      if (!result.ok) {
        setError(result.error || 'Login failed');
      } else {
        persistRememberMe(rememberMe, email);
      }
    }
    setLoading(false);
  };

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#f28c28]/50 transition';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: brand.bg }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-5" pad />
          <p className="text-[#94a3b8] text-sm">
            {mode === 'login' ? 'Welcome back — sign in to continue' : 'Create your free account'}
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: brand.surface }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); resetErrors(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition capitalize ${
                mode === m ? '' : 'text-[#94a3b8] hover:text-white'
              }`}
              style={mode === m ? { background: brand.accent, color: brand.onAccent } : undefined}>
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-4 border"
          style={{ background: brand.surface, borderColor: brand.border }}
        >
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input type="text" value={name} onChange={e => { setName(e.target.value); resetErrors(); }}
                  placeholder="Your name" required className={inputCls} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); resetErrors(); }}
                placeholder="you@email.com" required autoComplete="email" className={inputCls} />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); resetErrors(); }}
                  placeholder="10-digit mobile number" required className={inputCls} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Password</label>
            <PasswordInput
              value={password}
              onChange={v => { setPassword(v); resetErrors(); }}
              placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
              inputCls={inputCls}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5">Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={v => { setConfirmPassword(v); resetErrors(); }}
                placeholder="Repeat password"
                inputCls={inputCls}
                autoComplete="new-password"
              />
            </div>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => {
                  const checked = e.target.checked;
                  setRememberMe(checked);
                  if (!checked) persistRememberMe(false, '');
                }}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#f28c28] cursor-pointer"
              />
              <span className="text-sm text-[#94a3b8] group-hover:text-white transition">
                Remember me for 30 days
              </span>
            </label>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 disabled:opacity-60 font-semibold py-3 rounded-xl transition"
            style={{ background: brand.accent, color: brand.onAccent }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-[10px] text-[#64748b] leading-relaxed">
            Free: build & preview on this device ({STORAGE_POLICY_DAYS} days) ·
            ₹{process.env.NEXT_PUBLIC_PREMIUM_PRICE || 99} = export, share & deploy
          </p>
        </form>
      </motion.div>
    </div>
  );
}

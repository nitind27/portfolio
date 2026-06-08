'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Crown, Loader2, Lock, Mail, Phone, User, Shield, Calendar,
  CheckCircle2, Globe,
} from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import { useBuilderStore } from '@/lib/store';
import { brand } from '@/lib/brand';
import type { UserProfile } from '@/lib/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wide">
      {children}
    </label>
  );
}

const INPUT =
  'w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition';

export default function ProfilePageClient() {
  const router = useRouter();
  const { isAuthenticated, authLoading, initAuth, refreshSession } = useBuilderStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/?login=1');
      return;
    }
    fetch('/api/profile', { credentials: 'include' })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load profile');
        setProfile(d.profile);
        setName(d.profile.name || '');
        setPhone(d.profile.phone || '');
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setProfile(data.profile);
      setProfileMsg(data.message || 'Profile updated');
      await refreshSession();
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg('');
    setPasswordErr('');
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');
      setProfile(data.profile);
      setPasswordMsg(data.message || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshSession();
    } catch (err) {
      setPasswordErr(err instanceof Error ? err.message : 'Password update failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <MarketingShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.accent }} />
        </div>
      </MarketingShell>
    );
  }

  if (error || !profile) {
    return (
      <MarketingShell title="My Profile" subtitle="Account settings">
        <div className="max-w-lg mx-auto py-16 text-center">
          <p className="text-red-300 mb-4">{error || 'Profile unavailable'}</p>
          <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm">← Back to dashboard</Link>
        </div>
      </MarketingShell>
    );
  }

  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const isGoogle = profile.authProvider === 'google' || profile.googleLinked;

  return (
    <MarketingShell title="My Profile" subtitle="View and manage your account">
      <div className={`mx-auto space-y-6 ${'max-w-3xl'}`}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        {/* Profile overview */}
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{ background: brand.surface, borderColor: brand.border }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 border border-white/10"
                style={{ background: brand.accentMuted, color: brand.accentLight }}
              >
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white truncate">{profile.name}</h2>
                {profile.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-500/30 text-blue-300 bg-blue-500/10">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
                {profile.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-500/30 text-amber-300 bg-amber-500/10">
                    <Crown className="w-3 h-3" /> {profile.planName || 'Premium'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {profile.email}
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Member since {formatDate(profile.memberSince)}
                </span>
                {isGoogle && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-white/10 bg-white/[0.03]">
                    <Globe className="w-3.5 h-3.5 text-blue-300" /> Google linked
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{ background: brand.surface, borderColor: brand.border }}
        >
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: brand.accent }} /> Profile details
          </h3>
          <p className="text-sm text-gray-500 mb-5">Update your display name and contact number.</p>

          <form onSubmit={saveProfile} className="space-y-4 max-w-md">
            <div>
              <FieldLabel>Full name</FieldLabel>
              <input value={name} onChange={e => setName(e.target.value)} required minLength={2} className={INPUT} />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input value={profile.email} disabled className={`${INPUT} opacity-60 cursor-not-allowed`} />
              <p className="text-[10px] text-gray-600 mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className={`${INPUT} pl-10`}
                />
              </div>
            </div>

            {profileErr && <p className="text-red-300 text-xs">{profileErr}</p>}
            {profileMsg && (
              <p className="text-green-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {profileMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition hover:brightness-110"
              style={{ background: brand.accent, color: brand.onAccent }}
            >
              {profileSaving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{ background: brand.surface, borderColor: brand.border }}
        >
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Lock className="w-5 h-5" style={{ color: brand.accent }} />
            {profile.hasPassword ? 'Change password' : 'Set password'}
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {profile.hasPassword
              ? 'Use a strong password with at least 6 characters.'
              : isGoogle
                ? 'You signed in with Google. Set a password to also login with email.'
                : 'Create a password for email login.'}
          </p>

          <form onSubmit={savePassword} className="space-y-4 max-w-md">
            {profile.hasPassword && (
              <div>
                <FieldLabel>Current password</FieldLabel>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={INPUT}
                />
              </div>
            )}
            <div>
              <FieldLabel>{profile.hasPassword ? 'New password' : 'Password'}</FieldLabel>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={INPUT}
              />
            </div>
            <div>
              <FieldLabel>Confirm password</FieldLabel>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={INPUT}
              />
            </div>

            {passwordErr && <p className="text-red-300 text-xs">{passwordErr}</p>}
            {passwordMsg && (
              <p className="text-green-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {passwordMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition hover:brightness-110"
              style={{ background: brand.accent, color: brand.onAccent }}
            >
              {passwordSaving ? 'Updating…' : profile.hasPassword ? 'Change password' : 'Set password'}
            </button>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}

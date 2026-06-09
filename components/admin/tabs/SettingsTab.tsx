'use client';

import { useEffect, useState } from 'react';
import { Loader2, Lock, CheckCircle2, User, Mail, Phone, Save } from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, adminCard, adminCardStyle, adminInput, AdminPasswordInput } from '../ui';
import { useBuilderStore } from '@/lib/store';
import type { UserProfile } from '@/lib/types';

export default function SettingsTab() {
  const { refreshSession } = useBuilderStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const hasPassword = profile?.hasPassword !== false;
  const emailChanging = profile ? email.trim().toLowerCase() !== profile.email.toLowerCase() : false;

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load profile');
        setProfile(d.profile);
        setName(d.profile.name || '');
        setEmail(d.profile.email || '');
        setPhone(d.profile.phone || '');
      })
      .catch(() => setProfileError('Could not load account settings'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          phone,
          ...(emailChanging && profileCurrentPassword ? { currentPassword: profileCurrentPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      setProfile(data.profile);
      setName(data.profile.name || '');
      setEmail(data.profile.email || '');
      setPhone(data.profile.phone || '');
      setProfileCurrentPassword('');
      setProfileMessage(data.message || 'Profile updated');
      await refreshSession();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Profile update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordMessage('');
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
      setPasswordMessage(data.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshSession();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Password update failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <p className="text-sm text-gray-500">Loading account settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <SectionHeader
        title="Account settings"
        desc="Update your admin name, login email, phone, and password"
      />

      <div className={`${adminCard} p-6`} style={adminCardStyle}>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-white">Profile details</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">Changes to email affect how you sign in.</p>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Full name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className={adminInput}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Login email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={adminInput}
              required
              autoComplete="email"
            />
            {emailChanging && (
              <p className="text-[10px] text-amber-400/90 mt-1.5">
                Email is changing — enter your current password below to confirm.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={adminInput}
              placeholder="10-digit mobile number"
              autoComplete="tel"
            />
          </div>

          {emailChanging && hasPassword && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current password (to change email)</label>
              <AdminPasswordInput
                value={profileCurrentPassword}
                onChange={setProfileCurrentPassword}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>
          )}

          {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
          {profileMessage && (
            <p className="text-green-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{ background: brand.accent, color: brand.onAccent }}
          >
            {profileSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save profile</>}
          </button>
        </form>
      </div>

      <div className={`${adminCard} p-6`} style={adminCardStyle}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-white">{hasPassword ? 'Change password' : 'Set password'}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          {hasPassword
            ? 'Use at least 6 characters. Click the eye icon to show or hide passwords.'
            : 'Create a password so you can sign in with email and password.'}
        </p>

        <form onSubmit={savePassword} className="space-y-4">
          {hasPassword && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current password</label>
              <AdminPasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{hasPassword ? 'New password' : 'Password'}</label>
            <AdminPasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Confirm password</label>
            <AdminPasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat new password"
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
          {passwordMessage && (
            <p className="text-green-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{ background: brand.accent, color: brand.onAccent }}
          >
            {passwordSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : hasPassword ? 'Update password' : 'Set password'}
          </button>
        </form>
      </div>
    </div>
  );
}

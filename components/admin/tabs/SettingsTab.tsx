'use client';

import { useState } from 'react';
import { Loader2, Lock, CheckCircle2, User } from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, adminCard, adminCardStyle, adminInput } from '../ui';
import { useBuilderStore } from '@/lib/store';

export default function SettingsTab() {
  const { user, refreshSession } = useBuilderStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const hasPassword = user?.hasPassword !== false;

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');
      setMessage(data.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <SectionHeader
        title="Account settings"
        desc="Manage your admin login credentials"
      />

      <div className={`${adminCard} p-6`} style={adminCardStyle}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: brand.accentMuted, color: brand.accentLight }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              {user?.name}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-[10px] text-orange-400/80 uppercase tracking-wider mt-0.5">Administrator</p>
          </div>
        </div>
      </div>

      <div className={`${adminCard} p-6`} style={adminCardStyle}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-white">{hasPassword ? 'Change password' : 'Set password'}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          {hasPassword
            ? 'Use at least 6 characters. You will stay signed in after changing your password.'
            : 'Create a password so you can sign in with email and password.'}
        </p>

        <form onSubmit={savePassword} className="space-y-4">
          {hasPassword && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={adminInput}
                autoComplete="current-password"
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{hasPassword ? 'New password' : 'Password'}</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={adminInput}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={adminInput}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && (
            <p className="text-green-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{ background: brand.accent, color: brand.onAccent }}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : hasPassword ? 'Update password' : 'Set password'}
          </button>
        </form>
      </div>
    </div>
  );
}

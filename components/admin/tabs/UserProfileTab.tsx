'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Mail, Phone, Crown, Shield, ExternalLink, Pencil, Trash2, Globe, Eye,
} from 'lucide-react';
import { brand } from '@/lib/brand';
import { SectionHeader, Badge, adminCard, adminCardStyle } from '../ui';
import type { AdminProjectSummary, AdminUserProfile } from '@/lib/admin-projects-server';

interface Props {
  userId: number;
}

export default function UserProfileTab({ userId }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminUserProfile | null>(null);
  const [projects, setProjects] = useState<AdminProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, projectsRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`),
        fetch(`/api/admin/users/${userId}/projects`),
      ]);
      const profileData = await profileRes.json();
      const projectsData = await projectsRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || 'Failed to load user');
      setProfile(profileData.profile);
      setProjects(projectsData.projects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
      setProfile(null);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const removeProject = async (projectId: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${userId}/projects/${projectId}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error || 'Delete failed');
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">{error || 'User not found'}</p>
        <button type="button" onClick={() => router.push('/admin')} className="mt-4 text-sm text-orange-400 hover:underline">
          Back to admin
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Users
        </button>
      </div>

      <SectionHeader
        title={profile.name}
        desc={`User profile · ${profile.projectCount} website${profile.projectCount === 1 ? '' : 's'}`}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`${adminCard} lg:col-span-1`} style={adminCardStyle}>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: brand.accentMuted, color: brand.accentLight }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white">{profile.name}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant={profile.role === 'admin' ? 'info' : 'default'}>{profile.role}</Badge>
                  {profile.isPremium && <Badge variant="warning">Premium</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] text-gray-400">
                <Mail className="w-4 h-4 shrink-0" /> {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] text-gray-400">
                  <Phone className="w-4 h-4 shrink-0" /> {profile.phone}
                </div>
              )}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] text-gray-400 text-xs">
                ID #{profile.id} · Joined {new Date(profile.createdAt).toLocaleDateString('en-IN')}
              </div>
              {profile.planName && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <Crown className="w-4 h-4" /> Plan: {profile.planName}
                </div>
              )}
              {profile.role === 'admin' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                  <Shield className="w-4 h-4" /> Administrator
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${adminCard} lg:col-span-2`} style={adminCardStyle}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" /> Websites / Projects
            </h3>
            <span className="text-xs text-gray-500">{projects.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 text-xs">
                      No projects yet for this user.
                    </td>
                  </tr>
                ) : projects.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-0.5">{p.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.published ? 'success' : 'default'}>
                        {p.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {p.published && p.previewUrl && (
                          <a
                            href={p.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/admin/builder?userId=${userId}&projectId=${p.id}`}
                          className="p-2 rounded-lg text-orange-400 hover:bg-orange-500/10"
                          title="Edit in builder"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeProject(p.id, p.name)}
                          className="p-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

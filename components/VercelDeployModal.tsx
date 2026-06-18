'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Triangle, Check, AlertCircle, Loader2, ExternalLink, Unlink, Shield, Rocket,
} from 'lucide-react';
import type { Portfolio } from '@/lib/types';
import {
  fetchVercelStatus, connectVercelToken, disconnectVercel, startVercelOAuth,
  fetchVercelTeams, setVercelTeam, deployToVercel, fetchVercelDeploymentStatus,
  type VercelConnectionStatus, type VercelTeam, type VercelDeploymentRecord,
} from '@/lib/vercel-client-side';
import AdminSelect from '@/components/admin/AdminSelect';

type Step = 'connect' | 'deploy' | 'success';

interface Props {
  open: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  onDeployed: (liveUrl: string, projectName: string) => void;
}

export default function VercelDeployModal({ open, onClose, portfolio, onDeployed }: Props) {
  const [step, setStep] = useState<Step>('connect');
  const [connection, setConnection] = useState<VercelConnectionStatus | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [teams, setTeams] = useState<VercelTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [format, setFormat] = useState<'nextjs' | 'static'>('nextjs');
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [existingDeployment, setExistingDeployment] = useState<VercelDeploymentRecord | null>(null);

  const reset = useCallback(() => {
    setStep('connect');
    setAccessToken('');
    setError('');
    setSelectedTeam('');
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      const data = await fetchVercelTeams();
      setTeams(data.teams);
    } catch {
      setTeams([]);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const [{ connection: conn }, { deployment }] = await Promise.all([
        fetchVercelStatus(),
        fetchVercelDeploymentStatus(portfolio.id),
      ]);
      setConnection(conn);
      setExistingDeployment(deployment);
      if (deployment?.liveUrl) setLiveUrl(deployment.liveUrl);
      if (deployment?.projectName) setProjectName(deployment.projectName);
      if (conn.connected) {
        setStep('deploy');
        if (conn.teamId) setSelectedTeam(conn.teamId);
        await loadTeams();
      }
    } catch {
      setConnection({ connected: false });
    }
  }, [loadTeams, portfolio.id]);

  useEffect(() => {
    if (!open) return;
    reset();
    loadStatus();
  }, [open, reset, loadStatus]);

  const handleTokenConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      await connectVercelToken(accessToken.trim());
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectVercel();
      setConnection({ connected: false });
      setStep('connect');
      setTeams([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed');
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setError('');
    try {
      if (selectedTeam) await setVercelTeam(selectedTeam);
      else await setVercelTeam(null);
      const result = await deployToVercel(portfolio, {
        teamId: selectedTeam || undefined,
        format,
      });
      setLiveUrl(result.liveUrl);
      setProjectName(result.projectName);
      onDeployed(result.liveUrl, result.projectName);
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deploy failed');
    } finally {
      setDeploying(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={e => e.target === e.currentTarget && !deploying && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shrink-0">
                <Triangle className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Deploy to your Vercel</h2>
                <p className="text-xs text-gray-500 mt-0.5">&quot;{portfolio.name}&quot; → your Vercel account</p>
              </div>
            </div>
            {!deploying && (
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'connect' && (
              <motion.div key="connect" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Shield className="w-4 h-4 text-gray-300" />
                    Use your own Vercel account
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Deployments go to <strong className="text-gray-400">your</strong> Vercel dashboard — not a shared account.
                    Connect via login or paste a personal access token from{' '}
                    <a href="https://vercel.com/account/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-white underline">
                      Vercel → Settings → Tokens
                    </a>.
                    Deployments appear only in <strong className="text-gray-300">your</strong> Vercel account — not site99&apos;s.
                  </p>
                </div>

                {connection?.oauthAvailable && (
                  <button
                    type="button"
                    onClick={() => startVercelOAuth(window.location.pathname + window.location.search)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition"
                  >
                    <Triangle className="w-4 h-4 fill-black" />
                    Login with Vercel
                  </button>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#111] px-2 text-gray-600">or paste token</span></div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Vercel Access Token</label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={e => setAccessToken(e.target.value)}
                    placeholder="Paste your Vercel token..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>

                <button
                  type="button"
                  disabled={connecting || accessToken.trim().length < 10}
                  onClick={handleTokenConnect}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 font-semibold text-sm transition border border-white/10"
                >
                  {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect with token'}
                </button>
              </motion.div>
            )}

            {step === 'deploy' && (
              <motion.div key="deploy" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {connection?.connected && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <Check className="w-4 h-4" />
                      {connection.accountLabel || 'Vercel connected'}
                    </div>
                    <button type="button" onClick={handleDisconnect} className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1">
                      <Unlink className="w-3 h-3" /> Disconnect
                    </button>
                  </div>
                )}

                {teams.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Deploy to team (optional)</label>
                    <AdminSelect
                      value={selectedTeam}
                      onChange={setSelectedTeam}
                      aria-label="Deploy to team"
                      options={[
                        { value: '', label: 'Personal account' },
                        ...teams.map(t => ({ value: t.id, label: t.name })),
                      ]}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Deploy format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['nextjs', 'static'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        className={`p-3 rounded-xl border text-left text-xs transition ${format === f ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
                      >
                        <p className="font-semibold">{f === 'nextjs' ? 'Next.js' : 'Static HTML'}</p>
                        <p className="text-[10px] mt-0.5 opacity-70">{f === 'nextjs' ? 'Recommended for React/Next export' : 'Simple static site'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {existingDeployment?.liveUrl && existingDeployment.status === 'live' && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                    <p className="text-xs text-blue-300 font-medium">Already deployed — updates go to the same Vercel project</p>
                    <p className="text-[10px] text-gray-500">Project: {existingDeployment.projectName}</p>
                    <a
                      href={existingDeployment.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {existingDeployment.liveUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                    {existingDeployment.updatedAt && (
                      <p className="text-[10px] text-gray-600">
                        Last updated {new Date(existingDeployment.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {existingDeployment?.liveUrl
                    ? 'Click below to push your latest changes to the same live site (no new project).'
                    : 'Build may take 1–3 minutes on Vercel. You can track progress in your Vercel dashboard.'}
                </p>

                <button
                  type="button"
                  disabled={deploying}
                  onClick={handleDeploy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  {deploying
                    ? (existingDeployment?.liveUrl ? 'Updating your site…' : 'Deploying to your Vercel…')
                    : (existingDeployment?.liveUrl ? 'Update live site' : 'Deploy now')}
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {existingDeployment?.liveUrl ? 'Site updated!' : 'Live on your Vercel!'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Project: {projectName}</p>
                </div>
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100"
                  >
                    Open site <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button type="button" onClick={onClose} className="block mx-auto text-xs text-gray-500 hover:text-white">
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

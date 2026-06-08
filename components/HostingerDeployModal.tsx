'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Globe, Link2, Rocket, Check, AlertCircle, Loader2, ExternalLink,
  Unlink, RefreshCw, ChevronRight, Shield, Server,
} from 'lucide-react';
import type { Portfolio } from '@/lib/types';
import {
  fetchHostingerStatus, connectHostinger, disconnectHostinger,
  fetchHostingerDomains, deployToHostinger,
  type HostingerConnectionStatus, type HostingerDeployTarget,
} from '@/lib/hostinger-client-side';

type Step = 'connect' | 'domain' | 'confirm' | 'deploy' | 'success';

interface Props {
  open: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  onDeployed: (liveUrl: string, domain: string) => void;
}

export default function HostingerDeployModal({ open, onClose, portfolio, onDeployed }: Props) {
  const [step, setStep] = useState<Step>('connect');
  const [connection, setConnection] = useState<HostingerConnectionStatus | null>(null);
  const [apiToken, setApiToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [domains, setDomains] = useState<HostingerDeployTarget[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [deployedDomain, setDeployedDomain] = useState('');
  const [domainPicked, setDomainPicked] = useState(false);

  const reset = useCallback(() => {
    setStep('connect');
    setApiToken('');
    setError('');
    setSelectedDomain('');
    setCustomDomain('');
    setUseCustom(false);
    setLiveUrl('');
    setDeployedDomain('');
    setDomainPicked(false);
  }, []);

  const loadDomains = useCallback(async () => {
    setLoadingDomains(true);
    setError('');
    try {
      const data = await fetchHostingerDomains();
      setDomains(data.domains);
      // Do not auto-select — user must pick a domain explicitly
      setSelectedDomain('');
      setUseCustom(false);
      setDomainPicked(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load domains');
    } finally {
      setLoadingDomains(false);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const { connection: conn } = await fetchHostingerStatus();
      setConnection(conn);
      if (conn.connected) {
        setStep('domain');
        await loadDomains();
      }
    } catch {
      setConnection({ connected: false });
    }
  }, [loadDomains]);

  useEffect(() => {
    if (!open) return;
    reset();
    loadStatus();
  }, [open, reset, loadStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      await connectHostinger(apiToken.trim());
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectHostinger();
      setConnection({ connected: false });
      setStep('connect');
      setDomains([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed');
    }
  };

  const effectiveDomain = useCustom ? customDomain.trim().toLowerCase() : selectedDomain;

  const pickDomain = (domain: string) => {
    setSelectedDomain(domain);
    setUseCustom(false);
    setCustomDomain('');
    setDomainPicked(true);
    setError('');
  };

  const pickCustomDomain = () => {
    setUseCustom(true);
    setSelectedDomain('');
    setDomainPicked(false);
    setError('');
  };

  const handleContinueToConfirm = () => {
    if (!effectiveDomain) {
      setError('Please select or enter a domain first');
      return;
    }
    if (useCustom && customDomain.trim().length < 4) {
      setError('Enter a valid domain (e.g. yourdomain.com)');
      return;
    }
    if (!domainPicked && !useCustom) {
      setError('Click a domain from the list to select it');
      return;
    }
    if (useCustom) setDomainPicked(true);
    setError('');
    setStep('confirm');
  };

  const handleDeploy = async () => {
    if (!effectiveDomain) {
      setError('Please select or enter a domain');
      return;
    }
    setDeploying(true);
    setError('');
    setStep('deploy');
    try {
      const result = await deployToHostinger(portfolio, effectiveDomain);
      setLiveUrl(result.liveUrl);
      setDeployedDomain(result.domain);
      onDeployed(result.liveUrl, result.domain);
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deploy failed');
      setStep('confirm');
    } finally {
      setDeploying(false);
    }
  };

  if (!open) return null;

  const readyDomains = domains.filter(d => d.ready);
  const pendingDomains = domains.filter(d => !d.ready);

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
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#673DE6] to-[#FF6B00] flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Go Live on Hostinger</h2>
                <p className="text-xs text-gray-500 mt-0.5">Deploy &quot;{portfolio.name}&quot; to your domain</p>
              </div>
            </div>
            {!deploying && (
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Steps indicator */}
          <div className="flex gap-1 mt-4">
            {(['connect', 'domain', 'confirm', 'deploy'] as const).map((s, i) => {
              const labels = ['Connect', 'Domain', 'Confirm', 'Deploy'];
              const stepOrder: Step[] = ['connect', 'domain', 'confirm', 'deploy', 'success'];
              const currentIdx = stepOrder.indexOf(step === 'success' ? 'deploy' : step);
              const thisIdx = i;
              const done = currentIdx > thisIdx || step === 'success';
              const active = step === s || (step === 'success' && s === 'deploy');
              return (
                <div key={s} className="flex-1">
                  <div className={`h-1 rounded-full ${done ? 'bg-blue-600' : active ? 'bg-blue-600/60' : 'bg-white/10'}`} />
                  <p className={`text-[10px] mt-1 truncate ${active || done ? 'text-blue-300' : 'text-gray-600'}`}>{labels[i]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'connect' && (
              <motion.div key="connect" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Connect your Hostinger account
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Get your API token from{' '}
                    <a href="https://hpanel.hostinger.com/profile/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      hPanel → Profile → API
                    </a>
                    . Your token is encrypted and stored securely — we never share it.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Hostinger API Token</label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    placeholder="Paste your API token here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  disabled={connecting || apiToken.trim().length < 20}
                  onClick={handleConnect}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#673DE6] to-[#7C3AED] hover:from-[#5b35cc] hover:to-[#6d28d9] disabled:opacity-40 font-semibold text-sm transition"
                >
                  {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {connecting ? 'Verifying...' : 'Connect Hostinger'}
                </button>
              </motion.div>
            )}

            {step === 'domain' && (
              <motion.div key="domain" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                {connection?.connected && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <Check className="w-4 h-4" />
                      {connection.accountLabel || 'Hostinger connected'}
                    </div>
                    <button type="button" onClick={handleDisconnect} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-400 transition">
                      <Unlink className="w-3 h-3" /> Disconnect
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Select domain to deploy</p>
                  <button type="button" onClick={loadDomains} disabled={loadingDomains} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5" title="Refresh domains">
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingDomains ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-gray-500">Choose where this site should go live. Deploy only starts after you confirm on the next step.</p>

                {effectiveDomain && domainPicked && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-blue-300 uppercase tracking-wider">Selected</p>
                      <p className="text-sm font-medium text-white truncate">{effectiveDomain}</p>
                    </div>
                  </div>
                )}

                {loadingDomains ? (
                  <div className="flex items-center justify-center py-8 text-gray-500 text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading domains...
                  </div>
                ) : (
                  <>
                    {readyDomains.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Ready to deploy</p>
                        {readyDomains.map(d => (
                          <button
                            key={d.domain}
                            type="button"
                            onClick={() => pickDomain(d.domain)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                              !useCustom && selectedDomain === d.domain && domainPicked
                                ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40'
                                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Server className="w-4 h-4 text-blue-400 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-white truncate">{d.domain}</p>
                                <p className="text-[10px] text-gray-500">Hosting website · ready</p>
                              </div>
                            </div>
                            {!useCustom && selectedDomain === d.domain && domainPicked && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {pendingDomains.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Registered domains (setup needed)</p>
                        {pendingDomains.slice(0, 5).map(d => (
                          <div key={d.domain} className="p-3 rounded-xl border border-white/5 bg-white/2 opacity-60">
                            <p className="text-sm text-gray-400">{d.domain}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{d.note}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {readyDomains.length === 0 && !loadingDomains && (
                      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/90">
                        No ready websites found in Hostinger. Create a website in hPanel for your domain, or enter a custom domain below.
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={pickCustomDomain}
                        className={`w-full flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                          useCustom ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Enter custom domain manually</span>
                      </button>
                      {useCustom && (
                        <input
                          value={customDomain}
                          onChange={e => {
                            setCustomDomain(e.target.value);
                            setDomainPicked(e.target.value.trim().length >= 4);
                          }}
                          placeholder="yourdomain.com"
                          className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      )}
                    </div>
                  </>
                )}

                {portfolio.hosting?.liveUrl && (
                  <div className="p-3 rounded-xl bg-white/3 border border-white/10">
                    <p className="text-[10px] text-gray-600 mb-1">Currently live at</p>
                    <a href={portfolio.hosting.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                      {portfolio.hosting.liveUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/10 text-center">
                  <p className="text-xs text-gray-500 mb-2">You are about to deploy</p>
                  <p className="text-lg font-bold text-white break-all">{effectiveDomain}</p>
                  <p className="text-xs text-gray-500 mt-2">Project: {portfolio.name}</p>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 px-1">
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" /> Static HTML site will be uploaded to Hostinger</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" /> Existing files on this domain may be replaced</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" /> SSL & DNS may take a few minutes after deploy</li>
                </ul>
                <button type="button" onClick={() => setStep('domain')} className="text-xs text-blue-400 hover:underline">
                  ← Change domain
                </button>
              </motion.div>
            )}

            {step === 'deploy' && (
              <motion.div key="deploy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                  <Rocket className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">Deploying to {effectiveDomain}</p>
                  <p className="text-xs text-gray-500 mt-1">Building site, uploading files, and going live...</p>
                  <p className="text-[10px] text-gray-600 mt-2">This may take 1–3 minutes. Don&apos;t close this window.</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">Your site is live!</p>
                  <p className="text-sm text-gray-400 mt-1">Deployed to your Hostinger domain</p>
                </div>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open {deployedDomain}
                </a>
                <p className="text-[10px] text-gray-600 text-center max-w-xs">
                  DNS & SSL may take a few minutes to propagate. Redeploy anytime to update your live site.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 'deploy' && step !== 'success' && (
          <div className="px-5 py-4 border-t border-white/10 flex gap-3 shrink-0">
            {step === 'domain' && (
              <>
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!effectiveDomain || !domainPicked || loadingDomains}
                  onClick={handleContinueToConfirm}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-sm transition"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {step === 'confirm' && (
              <>
                <button type="button" onClick={() => setStep('domain')} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!effectiveDomain}
                  onClick={handleDeploy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-sm transition"
                >
                  <Rocket className="w-4 h-4" /> Deploy to {effectiveDomain.length > 18 ? effectiveDomain.slice(0, 16) + '…' : effectiveDomain}
                </button>
              </>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="px-5 py-4 border-t border-white/10 shrink-0">
            <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition">
              Done
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

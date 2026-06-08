import type { Portfolio } from './types';

const STORAGE_PREFIX = 'pb-preview-';
const CHANNEL_NAME = 'pb-preview-sync';

function storageKey(projectId: string) {
  return `${STORAGE_PREFIX}${projectId}`;
}

export function writePreviewSnapshot(portfolio: Portfolio) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(storageKey(portfolio.id), JSON.stringify(portfolio));
  } catch {
    // sessionStorage quota — preview tab can fall back to API
  }
}

export function readPreviewSnapshot(projectId: string): Portfolio | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    return JSON.parse(raw) as Portfolio;
  } catch {
    return null;
  }
}

export function openPreviewInNewTab(portfolio: Portfolio) {
  writePreviewSnapshot(portfolio);
  const url = `/preview/${encodeURIComponent(portfolio.id)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function broadcastPreviewUpdate(portfolio: Portfolio) {
  if (typeof window === 'undefined') return;
  writePreviewSnapshot(portfolio);
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'update', projectId: portfolio.id, portfolio });
    channel.close();
  } catch {
    // BroadcastChannel not supported
  }
}

export function subscribePreviewUpdates(
  projectId: string,
  onUpdate: (portfolio: Portfolio) => void,
) {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; projectId?: string; portfolio?: Portfolio };
      if (data?.type === 'update' && data.projectId === projectId && data.portfolio) {
        onUpdate(data.portfolio);
      }
    };
  } catch {
    // ignore
  }

  return () => {
    channel?.close();
  };
}

export function getPreviewTabUrl(projectId: string) {
  return `/preview/${encodeURIComponent(projectId)}`;
}

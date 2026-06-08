import path from 'path';
import { Readable } from 'stream';
import * as tus from 'tus-js-client';

const BASE_URL = (process.env.HOSTINGER_API_BASE || 'https://developers.hostinger.com').replace(/\/$/, '');

export interface HostingerDomain {
  domain: string;
  type?: string;
  status?: string;
  expires_at?: string;
}

export interface HostingerWebsite {
  domain: string;
  username: string;
  order_id?: number;
  is_enabled?: boolean;
  created_at?: string;
}

export interface HostingerOrder {
  id: number;
  status?: string;
  plan?: string;
}

export interface UploadCredentials {
  url: string;
  auth_key: string;
  rest_auth_key: string;
}

export class HostingerApiError extends Error {
  constructor(message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = 'HostingerApiError';
  }
}

async function hostingerFetch<T>(
  apiToken: string,
  method: string,
  apiPath: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}/${apiPath.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    throw new HostingerApiError(
      `Hostinger API error (${res.status}): ${typeof data === 'object' ? JSON.stringify(data) : text}`,
      res.status,
      data,
    );
  }
  return data as T;
}

export async function verifyHostingerToken(apiToken: string): Promise<{ ok: true; domainCount: number }> {
  const res = await hostingerFetch<{ data?: unknown[] }>(apiToken, 'GET', '/api/domains/v1/portfolio');
  return { ok: true, domainCount: Array.isArray(res.data) ? res.data.length : 0 };
}

export async function listHostingerDomains(apiToken: string): Promise<HostingerDomain[]> {
  const res = await hostingerFetch<{ data?: HostingerDomain[] }>(apiToken, 'GET', '/api/domains/v1/portfolio');
  return (res.data || []).map(d => ({
    domain: d.domain,
    type: d.type,
    status: d.status,
    expires_at: d.expires_at,
  }));
}

export async function listHostingerWebsites(apiToken: string): Promise<HostingerWebsite[]> {
  const res = await hostingerFetch<{ data?: HostingerWebsite[] }>(apiToken, 'GET', '/api/hosting/v1/websites?per_page=100');
  return (res.data || []).map(w => ({
    domain: w.domain,
    username: w.username,
    order_id: w.order_id,
    is_enabled: w.is_enabled,
    created_at: w.created_at,
  }));
}

export async function listHostingerOrders(apiToken: string): Promise<HostingerOrder[]> {
  const res = await hostingerFetch<{ data?: HostingerOrder[] }>(apiToken, 'GET', '/api/hosting/v1/orders?per_page=50');
  return res.data || [];
}

export async function resolveUsername(apiToken: string, domain: string): Promise<string> {
  const res = await hostingerFetch<{ data?: { username: string }[] }>(
    apiToken, 'GET', `/api/hosting/v1/websites?domain=${encodeURIComponent(domain)}`,
  );
  const websites = res.data;
  if (!websites?.length) {
    throw new HostingerApiError(
      `No Hostinger website found for "${domain}". Add this domain in hPanel first, or create a website for it.`,
      404,
    );
  }
  return websites[0].username;
}

export async function fetchUploadCredentials(
  apiToken: string, username: string, domain: string,
): Promise<UploadCredentials> {
  const res = await hostingerFetch<UploadCredentials>(
    apiToken, 'POST', '/api/hosting/v1/files/upload-urls', { username, domain },
  );
  if (!res.url || !res.auth_key || !res.rest_auth_key) {
    throw new HostingerApiError('Invalid upload credentials from Hostinger');
  }
  return res;
}

function uploadBufferViaTus(
  buffer: Buffer,
  filename: string,
  uploadUrl: string,
  authToken: string,
  authRestToken: string,
): Promise<{ filename: string }> {
  return new Promise((resolve, reject) => {
    const cleanUrl = uploadUrl.replace(/\/$/, '');
    const normalized = filename.replace(/\\/g, '/');
    const uploadUrlWithFile = `${cleanUrl}/${normalized}?override=true`;
    const stream = Readable.from(buffer);

    const headers = {
      'X-Auth': authToken,
      'X-Auth-Rest': authRestToken,
      'upload-length': buffer.length.toString(),
      'upload-offset': '0',
    };

    fetch(uploadUrlWithFile, { method: 'POST', headers }).then(pre => {
      if (pre.status !== 201) {
        return pre.text().then(t => reject(new HostingerApiError(`Upload init failed (${pre.status}): ${t}`, pre.status)));
      }

      const upload = new tus.Upload(stream, {
        uploadUrl: uploadUrlWithFile,
        retryDelays: [1000, 2000, 4000, 8000],
        uploadDataDuringCreation: false,
        chunkSize: 10 * 1024 * 1024,
        headers,
        uploadSize: buffer.length,
        metadata: { filename: path.basename(normalized) },
        onError: (err: Error) => reject(new HostingerApiError(`Upload failed: ${err.message}`)),
        onSuccess: () => resolve({ filename: normalized }),
      });
      upload.start();
    }).catch(reject);
  });
}

export async function triggerStaticDeploy(
  apiToken: string, username: string, domain: string, archiveBasename: string,
): Promise<unknown> {
  return hostingerFetch(
    apiToken, 'POST',
    `/api/hosting/v1/accounts/${encodeURIComponent(username)}/websites/${encodeURIComponent(domain)}/deploy`,
    { archive_path: archiveBasename },
  );
}

export async function deployStaticWebsite(
  apiToken: string,
  domain: string,
  zipBuffer: Buffer,
): Promise<{ liveUrl: string; domain: string }> {
  const normalizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  if (!normalizedDomain || !normalizedDomain.includes('.')) {
    throw new HostingerApiError('Invalid domain name');
  }

  const username = await resolveUsername(apiToken, normalizedDomain);
  const creds = await fetchUploadCredentials(apiToken, username, normalizedDomain);

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const archiveName = `portfolio_${timestamp}.zip`;

  await uploadBufferViaTus(zipBuffer, archiveName, creds.url, creds.auth_key, creds.rest_auth_key);
  await triggerStaticDeploy(apiToken, username, normalizedDomain, archiveName);

  return {
    domain: normalizedDomain,
    liveUrl: `https://${normalizedDomain}`,
  };
}

export async function generateFreeSubdomain(apiToken: string): Promise<string | null> {
  try {
    const res = await hostingerFetch<{ data?: { domain?: string } }>(
      apiToken, 'POST', '/api/hosting/v1/domains/free-subdomains', {},
    );
    return res.data?.domain || null;
  } catch {
    return null;
  }
}

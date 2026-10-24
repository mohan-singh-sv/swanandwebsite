import { env } from '../config';
import { unwrap } from './normalize';
import { signRequest } from './sign';

type RequestOptions = {
  method?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signed?: boolean;
  envelope?: boolean;
  accessToken?: string;
};

function buildPath(path: string, query?: RequestOptions['query']) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function flattenApiMessage(json: any): string {
  const value = json?.message || json?.error;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        return item?.message || (item?.constraints && Object.values(item.constraints).join(', ')) || JSON.stringify(item);
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof value === 'string') return value;
  return '';
}

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}) {
  const pathWithQuery = buildPath(path, options.query);
  const method = (options.method || 'GET').toUpperCase();
  const url = `${env.apiBaseUrl}${pathWithQuery}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  if (options.signed !== false) Object.assign(headers, signRequest().headers);
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  const response = await fetch(url, { method, headers, body });
  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text };
  }
  if (!response.ok) {
    const message = flattenApiMessage(json) || `Request failed (${response.status})`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return options.envelope ? json : unwrap<T>(json);
}

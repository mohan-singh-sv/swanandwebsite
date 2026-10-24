import { env } from '../config';

function asUrl(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return String(record.url || record.src || record.imageUrl || record.key || record.path || '').trim();
  }
  return '';
}

export function resolveMediaUrl(value: unknown, assetBaseUrl?: string) {
  const raw = asUrl(value);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const origin = env.apiBaseUrl || window.location.origin;
  const base = (assetBaseUrl || origin).replace(/\/$/, '');
  if (raw.startsWith('/')) return `${origin}${raw}`;
  return `${base}/${raw.replace(/^\//, '')}`;
}

export function firstImage(record: any, assetBaseUrl?: string) {
  const candidates = [
    record?.coverImageUrl,
    record?.hoverImageUrl,
    record?.bannerImageUrl,
    record?.bannerUrl,
    record?.desktopImageUrl,
    record?.mobileImageUrl,
    record?.fileUrl,
    record?.src,
    record?.imageUrl,
    record?.image,
    record?.thumbnail,
    record?.coverImage,
    record?.photo,
    record?.logoBlackUrl,
    record?.logoWhiteUrl,
    record?.logoImageUrl,
    record?.logoWhiteImageUrl,
    record?.logo,
    ...(Array.isArray(record?.images) ? record.images : []),
    ...(Array.isArray(record?.media) ? record.media : []),
  ];
  for (const candidate of candidates) {
    const url = resolveMediaUrl(candidate, assetBaseUrl);
    if (url) return url;
  }
  return '';
}

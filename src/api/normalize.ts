export function unwrap<T = any>(payload: any): T {
  if (payload == null) return payload;
  if (typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

export function asArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object') return [];
  const keys = [
    'banners',
    'collections',
    'products',
    'sections',
    'slides',
    'slider',
    'heroBanners',
    'homeBanners',
    'items',
    'results',
    'records',
    'rows',
    'orders',
    'faqs',
    'fields',
    'locations',
    'menu',
    'tabs',
    'children',
    'tags',
  ];
  let best: T[] = [];
  for (const key of keys) {
    if (Array.isArray(value[key]) && value[key].length > best.length) best = value[key] as T[];
  }
  if (best.length) return best;
  if (Array.isArray(value.data)) return value.data as T[];
  return [];
}

export function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function parseLooseNumber(value: unknown): number | undefined {
  if (value == null || value === '' || typeof value === 'boolean') return undefined;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return parseLooseNumber(
      record.sellingPrice ??
        record.unitPrice ??
        record.salePrice ??
        record.offerPrice ??
        record.finalPrice ??
        record.amount ??
        record.price ??
        record.value ??
        record.mrp,
    );
  }
  const raw = String(value).trim();
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

export function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const num = parseLooseNumber(value);
    if (num != null) return num;
  }
  return 0;
}

export function pickId(record: any) {
  return pickString(record?.id, record?._id, record?.uuid, record?.slug, record?.handle);
}

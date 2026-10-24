import { firstImage, resolveMediaUrl } from './media';
import { apiRequest } from './client';
import { asArray, pickId, pickNumber, pickString } from './normalize';
import type {
  AuthUser,
  Banner,
  BrandSettings,
  CartLine,
  CartSnapshot,
  CheckoutField,
  Collection,
  FaqItem,
  HomeSection,
  MenuItem,
  PaymentMethodOption,
  Product,
  ProductOption,
  PromotionEval,
  PromotionOffer,
  StoreLocation,
  ThemeColors,
  WebsiteOrder,
} from './types';

const DEFAULT_THEME: ThemeColors = {
  primary: '#9E1817',
  accent: '#F5C400',
  background: '#FFF9E8',
  text: '#3B0A0A',
  sidebarBg: '#9E1817',
  sidebarText: '#FFFFFF',
};

function firstTag(record: any) {
  const tags = asArray(record?.tags || record?.labels);
  return pickString(
    record?.tag,
    record?.productTag,
    record?.subCategory,
    record?.subCategoryName,
    record?.productType,
    record?.collectionName,
    tags[0]?.label,
    tags[0]?.name,
    tags[0],
  );
}

function mapProduct(record: any, assetBaseUrl?: string): Product {
  const images = asArray(record?.images || record?.media)
    .map((item) => firstImage(item, assetBaseUrl) || resolveMediaUrl(item, assetBaseUrl))
    .filter(Boolean);
  const imageUrl = firstImage(record, assetBaseUrl) || images[0] || '';
  const variant = asArray(record?.variants || record?.skus || record?.prices)[0];
  return {
    id: pickId(record),
    slug: pickString(record?.slug, record?.handle, record?.websiteSlug, pickId(record)),
    title: pickString(record?.title, record?.name, record?.productName, 'Product'),
    description: pickString(record?.description, record?.shortDescription, record?.details),
    price: pickNumber(
      record?.sellingPrice,
      record?.unitPrice,
      record?.salePrice,
      record?.offerPrice,
      record?.finalPrice,
      record?.price,
      record?.amount,
      record?.pricing,
      record?.defaultPrice,
      variant?.sellingPrice,
      variant?.unitPrice,
      variant?.price,
      record?.mrp,
    ),
    compareAtPrice:
      pickNumber(record?.compareAtPrice, record?.mrp, record?.originalPrice, variant?.mrp, variant?.compareAtPrice) ||
      undefined,
    imageUrl,
    images: images.length ? images : imageUrl ? [imageUrl] : [],
    category: pickString(record?.categoryName, record?.category?.name, record?.category),
    unit: pickString(record?.unit, record?.uom, record?.packSize, record?.weight, record?.quantityUnit) || undefined,
    tag: firstTag(record) || undefined,
    inStock: record?.inStock !== false && record?.available !== false,
    options: mapProductOptions(record),
    raw: record,
  };
}

function mapProductOptions(record: any): ProductOption[] {
  const fromConfig = asArray(record?.configFields || record?.productConfig || record?.fields);
  const fromVariants = asArray(record?.options || record?.variantOptions);
  const fromCheckout = asArray(record?.checkoutFields).filter((field: any) => {
    const type = pickString(field?.fieldType, field?.type, 'text').toLowerCase();
    return type === 'select' || type === 'dropdown' || type === 'radio';
  });
  const source = fromConfig.length ? fromConfig : fromVariants.length ? fromVariants : fromCheckout;
  return source
    .map((field: any) => ({
      key: pickString(field?.key, field?.fieldKey, field?.name, pickId(field)),
      label: pickString(field?.label, field?.name, field?.title, 'Option'),
      values: asArray(field?.options || field?.values)
        .map((item: any) => pickString(item?.label, item?.value, item))
        .filter(Boolean),
    }))
    .filter((field) => field.key && field.values.length);
}

function uniqueLabels(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const label = value.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

function mapBanner(record: any, assetBaseUrl?: string): Banner {
  return {
    id: pickId(record),
    title: pickString(record?.title, record?.name, record?.heading),
    description: pickString(record?.description, record?.subtitle, record?.text),
    imageUrl:
      firstImage(record, assetBaseUrl) ||
      firstImage(record?.banner, assetBaseUrl) ||
      firstImage(record?.media, assetBaseUrl),
    videoUrl: resolveMediaUrl(record?.videoUrl, assetBaseUrl) || undefined,
    linkUrl: pickString(record?.linkUrl, record?.url, record?.href, record?.collectionHandle) || undefined,
    linkLabel: pickString(record?.linkLabel, record?.cta, record?.buttonLabel) || undefined,
    placement: pickString(record?.placement, record?.kind, record?.type) || undefined,
  };
}

function mapCollection(record: any, assetBaseUrl?: string): Collection {
  const tabs = uniqueLabels(
    asArray(
      record?.tabs ||
        record?.filters ||
        record?.categories ||
        record?.children ||
        record?.subCollections ||
        record?.subcategories,
    ).map((item: any) => pickString(item?.title, item?.name, item?.label, item?.handle, item)),
  );
  return {
    id: pickId(record),
    handle: pickString(record?.handle, record?.slug, pickId(record)),
    title: pickString(record?.title, record?.name, record?.label, 'Collection'),
    description: pickString(record?.description),
    imageUrl: firstImage(record, assetBaseUrl),
    tabs: tabs.length ? tabs : undefined,
  };
}

function mapMenu(records: any[]): MenuItem[] {
  return asArray(records).map((item) => ({
    id: pickId(item),
    label: pickString(item?.label, item?.title, item?.name),
    handle: pickString(item?.handle, item?.slug) || undefined,
    path: pickString(item?.path, item?.url, item?.linkUrl) || undefined,
    categoryId: pickString(item?.categoryId) || undefined,
    children: mapMenu(item?.children || item?.items || []),
  }));
}

function mapCheckoutField(record: any): CheckoutField {
  return {
    id: pickId(record),
    name: pickString(record?.name, record?.label, record?.fieldKey),
    fieldKey: pickString(record?.fieldKey, record?.key, record?.name),
    fieldType: pickString(record?.fieldType, record?.type, 'text') || 'text',
    options: asArray(record?.options)
      .map((item: any) => pickString(item?.label, item?.value, item))
      .filter(Boolean),
    placeholder: pickString(record?.placeholder) || undefined,
    helpText: pickString(record?.helpText) || undefined,
    required: Boolean(record?.required),
    maxLength: pickNumber(record?.maxLength) || undefined,
  };
}

function mapCartLine(record: any, assetBaseUrl?: string): CartLine {
  const product = record?.product || record;
  return {
    lineKey: pickString(record?.lineKey, record?.key, record?.id, product?.slug),
    slug: pickString(record?.slug, product?.slug),
    title: pickString(record?.title, product?.title, product?.name, 'Item'),
    imageUrl: firstImage(record, assetBaseUrl) || firstImage(product, assetBaseUrl),
    quantity: pickNumber(record?.quantity, record?.qty, 1) || 1,
    unitPrice: pickNumber(record?.unitPrice, record?.price, product?.price),
    options: record?.options,
    engraving: pickString(record?.engraving) || undefined,
    checkoutFields: record?.checkoutFields,
  };
}

function mapOrder(record: any, assetBaseUrl?: string): WebsiteOrder {
  const lines = asArray(record?.lines || record?.items || record?.products).map((line) =>
    mapCartLine(line, assetBaseUrl),
  );
  return {
    id: pickId(record),
    invoiceNo: pickString(record?.invoiceNo, record?.orderNo, record?.number) || undefined,
    status: pickString(record?.status, record?.orderStatus, 'PLACED') || 'PLACED',
    total: pickNumber(record?.totalPayableAmount, record?.total, record?.grandTotal, record?.amount),
    createdAt: pickString(record?.createdAt, record?.placedAt) || undefined,
    paymentMethod: pickString(record?.paymentMethod, record?.tender) || undefined,
    lines,
    raw: record,
  };
}

function mapPromoOffer(record: any): PromotionOffer {
  return {
    id: pickId(record) || pickString(record?.code),
    code: pickString(record?.code),
    name: pickString(record?.name, record?.code),
    summary: pickString(record?.summary),
    reason: pickString(record?.reason, record?.almost),
    requiresCouponCode: Boolean(record?.requiresCouponCode),
    applied: Boolean(record?.applied),
  };
}

function mapPromo(record: any): PromotionEval {
  const subtotal = pickNumber(record?.subtotal);
  const discountTotal = pickNumber(record?.discountTotal, record?.discount);
  return {
    subtotal,
    discountTotal,
    discountedSubtotal: pickNumber(record?.discountedSubtotal, Math.max(0, subtotal - discountTotal)),
    applied: asArray(record?.applied).map(mapPromoOffer),
    almost: asArray(record?.almost).map(mapPromoOffer),
    offers: asArray(record?.offers).map(mapPromoOffer),
    couponApplied: Boolean(record?.couponApplied),
    couponMessage: pickString(record?.couponMessage),
  };
}

function classifyPayment(id: string, label: string): PaymentMethodOption['kind'] {
  const hay = `${id} ${label}`.toLowerCase();
  if (hay.includes('cod') || hay.includes('cash on') || hay.includes('cash-on')) return 'cod';
  if (hay.includes('razor')) return 'razorpay';
  return 'other';
}

function normalizePaymentMethods(settings: any): PaymentMethodOption[] {
  const raw = asArray(
    settings?.paymentMethods ||
      settings?.payments ||
      settings?.checkout?.paymentMethods ||
      settings?.website?.paymentMethods ||
      settings?.tenders,
  );
  const mapped = raw
    .map((item: any) => {
      if (typeof item === 'string') {
        const id = item.toLowerCase();
        return { id, label: item, kind: classifyPayment(id, item) } as PaymentMethodOption;
      }
      const enabled = item?.enabled !== false && item?.isActive !== false && item?.active !== false;
      if (!enabled) return null;
      const id = pickString(item?.id, item?.code, item?.value, item?.name).toLowerCase();
      const label = pickString(item?.label, item?.name, item?.title, id);
      if (!id) return null;
      return { id, label: label || id.toUpperCase(), kind: classifyPayment(id, label) } as PaymentMethodOption;
    })
    .filter(Boolean) as PaymentMethodOption[];

  if (mapped.length) return mapped;

  const fallback: PaymentMethodOption[] = [];
  if (settings?.enableCod !== false && settings?.codEnabled !== false) {
    fallback.push({ id: 'cod', label: 'Cash on Delivery', kind: 'cod' });
  }
  if (settings?.razorpayKeyId || settings?.razorpay?.keyId || settings?.enableRazorpay) {
    fallback.push({ id: 'razorpay', label: 'Pay Online (Razorpay)', kind: 'razorpay' });
  }
  if (settings?.enableKnet || settings?.knet) {
    fallback.push({ id: 'knet', label: 'KNET', kind: 'other' });
  }
  return fallback.length
    ? fallback
    : [
        { id: 'cod', label: 'Cash on Delivery', kind: 'cod' },
        { id: 'razorpay', label: 'Pay Online (Razorpay)', kind: 'razorpay' },
      ];
}

function mapSettings(raw: any): BrandSettings {
  const source = raw?.settings || raw?.brand || raw || {};
  const theme = source.themeColors || source.theme || {};
  return {
    brandName: pickString(source.brandName, source.name, source.storeName, 'Swanand Online'),
    logoUrl: firstImage(source, source.assetBaseUrl) || resolveMediaUrl(source.logoBlackUrl, source.assetBaseUrl),
    logoWhiteUrl: resolveMediaUrl(source.logoWhiteUrl || source.logoWhiteImageUrl, source.assetBaseUrl),
    email: pickString(source.email, source.contactEmail),
    phone: pickString(source.phone, source.mobileNumber, source.mobile),
    address: pickString(source.address, source.storeAddress),
    website: pickString(source.website),
    currency: pickString(source.currency, 'INR') || 'INR',
    country: pickString(source.country, 'India') || 'India',
    assetBaseUrl: pickString(source.assetBaseUrl),
    themeColors: {
      primary: pickString(theme.primary, DEFAULT_THEME.primary) || DEFAULT_THEME.primary,
      accent: pickString(theme.accent, DEFAULT_THEME.accent) || DEFAULT_THEME.accent,
      background: pickString(theme.background, DEFAULT_THEME.background) || DEFAULT_THEME.background,
      text: pickString(theme.text, DEFAULT_THEME.text) || DEFAULT_THEME.text,
      sidebarBg: pickString(theme.sidebarBg, DEFAULT_THEME.sidebarBg) || DEFAULT_THEME.sidebarBg,
      sidebarText: pickString(theme.sidebarText, DEFAULT_THEME.sidebarText) || DEFAULT_THEME.sidebarText,
    },
    paymentMethods: normalizePaymentMethods(source),
    razorpayKeyId: pickString(source.razorpayKeyId, source.razorpay?.keyId) || undefined,
    social: source.socialMedia || source.social || {},
    raw: source,
  };
}

function pickAuthToken(raw: any) {
  return pickString(
    raw?.token,
    raw?.accessToken,
    raw?.sessionToken,
    raw?.data?.token,
    raw?.data?.accessToken,
    raw?.data?.sessionToken,
    raw?.customer?.token,
    raw?.customer?.sessionToken,
    raw?.user?.token,
    raw?.data?.customer?.token,
    raw?.data?.customer?.sessionToken,
    raw?.data?.user?.token,
  );
}

function mapAuth(raw: any, fallbackEmail?: string): AuthUser {
  const source = raw?.customer || raw?.user || raw?.data?.customer || raw?.data || raw || {};
  const customerId = pickString(source.customerId, source.id, source._id, raw?.customerId, raw?.data?.customerId);
  const token = pickAuthToken(raw);
  return {
    customerId,
    token: token && token !== customerId ? token : '',
    email: pickString(source.email, fallbackEmail),
    name: pickString(source.name, source.fullName, 'Guest'),
    phone: pickString(source.phone, source.mobile, source.mobileNumber),
    address: pickString(source.address) || undefined,
    city: pickString(source.city) || undefined,
  };
}

export const websiteApi = {
  health() {
    return apiRequest('/api/v1/website/health', { signed: false });
  },
  async settings() {
    const data = await apiRequest('/api/v1/website/settings');
    return mapSettings(data);
  },
  async banners(assetBaseUrl?: string) {
    const data = await apiRequest('/api/v1/website/banners');
    return asArray(data).map((item) => mapBanner(item, assetBaseUrl));
  },
  async announcements(assetBaseUrl?: string) {
    const data = await apiRequest('/api/v1/website/banners/announcements');
    return asArray(data).map((item) => mapBanner(item, assetBaseUrl));
  },
  async menu() {
    const data = await apiRequest('/api/v1/website/menu');
    return mapMenu(asArray(data));
  },
  async collections(assetBaseUrl?: string) {
    const data = await apiRequest('/api/v1/website/collections');
    return asArray(data).map((item) => mapCollection(item, assetBaseUrl));
  },
  async collection(handle: string, assetBaseUrl?: string) {
    const data = await apiRequest(`/api/v1/website/collections/${encodeURIComponent(handle)}`);
    const products = asArray(data?.products || data?.items || data).map((item) =>
      mapProduct(item, assetBaseUrl),
    );
    const collection = mapCollection(data?.collection || data, assetBaseUrl);
    const productTags = uniqueLabels(products.map((item) => item.tag || ''));
    return {
      collection: {
        ...collection,
        tabs: uniqueLabels([...(collection.tabs || []), ...productTags]),
      },
      products: products.filter((item) => item.slug),
    };
  },
  async sections(assetBaseUrl?: string): Promise<HomeSection[]> {
    const data = await apiRequest('/api/v1/website/sections');
    return asArray(data).map((section) => ({
      id: pickId(section),
      title: pickString(section.title, section.name),
      description: pickString(section.description),
      type: pickString(section.type, 'products') || 'products',
      products: asArray(section.products || section.items).map((item) => mapProduct(item, assetBaseUrl)),
      categories: asArray(section.categories || section.collections).map((item) =>
        mapCollection(item, assetBaseUrl),
      ),
      imageUrl: firstImage(section, assetBaseUrl) || undefined,
      linkUrl: pickString(section.linkUrl) || undefined,
      linkLabel: pickString(section.linkLabel, section.viewAllLabel) || undefined,
      viewAllUrl: pickString(section.viewAllUrl, section.viewAll) || undefined,
    }));
  },
  async search(query: string, assetBaseUrl?: string) {
    const data = await apiRequest('/api/v1/website/search', {
      query: { q: query },
    });
    return asArray(data?.products || data).map((item) => mapProduct(item, assetBaseUrl));
  },
  async product(slug: string, assetBaseUrl?: string) {
    const data = await apiRequest(`/api/v1/website/products/${encodeURIComponent(slug)}`);
    return mapProduct(data?.product || data, assetBaseUrl);
  },
  async productOffers(slug: string, customerId?: string) {
    return apiRequest(`/api/v1/website/promotions/product/${encodeURIComponent(slug)}`, {
      query: { quantity: 1, customerId },
    });
  },
  async faqs(placement?: string): Promise<FaqItem[]> {
    const data = await apiRequest('/api/v1/website/faqs', { query: { placement } });
    const groups = asArray(data);
    return groups.flatMap((group: any) => {
      const items = asArray(group?.items);
      if (items.length) {
        return items.map((item: any) => ({
          id: pickId(item) || pickId(group),
          question: pickString(item?.question, item?.title, group?.title),
          answer: pickString(item?.answer, item?.body, group?.body),
          placement: pickString(group?.kind, placement),
        }));
      }
      return [
        {
          id: pickId(group),
          question: pickString(group?.question, group?.title),
          answer: pickString(group?.answer, group?.body),
          placement: pickString(group?.kind, placement),
        },
      ].filter((item) => item.question);
    });
  },
  async locations(assetBaseUrl?: string): Promise<StoreLocation[]> {
    const data = await apiRequest('/api/v1/website/locations');
    return asArray(data).map((item) => ({
      id: pickId(item),
      name: pickString(item.name, item.title, item.branchName, 'Store'),
      address: pickString(item.address, item.fullAddress),
      phone: pickString(item.phone),
      email: pickString(item.email),
      hours: asArray(item.hours).map(String),
      imageUrl: firstImage(item, assetBaseUrl),
      mapUrl: pickString(item.mapUrl),
      tags: asArray(item.tags).map((tag: any) => pickString(tag?.label, tag)),
    }));
  },
  async checkoutFields() {
    const data = await apiRequest('/api/v1/website/checkout-fields');
    return asArray(data).map(mapCheckoutField);
  },
  async lookup(email: string) {
    const data = await apiRequest('/api/v1/website/auth/lookup', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
    });
    return {
      exists: Boolean(data?.exists),
      hasPassword: Boolean(data?.hasPassword),
      raw: data,
    };
  },
  sendOtp(email: string, name?: string) {
    return apiRequest('/api/v1/website/auth/otp/send', { method: 'POST', body: { email, name } });
  },
  verifyOtp(email: string, code: string) {
    return apiRequest('/api/v1/website/auth/otp/verify', { method: 'POST', body: { email, code } });
  },
  async register(input: {
    email: string;
    password: string;
    verificationToken: string;
    name: string;
    phone: string;
    address?: string;
    city?: string;
  }) {
    const data = await apiRequest('/api/v1/website/auth/register', { method: 'POST', body: input, envelope: true });
    return mapAuth(data, input.email);
  },
  async login(email: string, password: string) {
    const data = await apiRequest('/api/v1/website/auth/login', {
      method: 'POST',
      body: { email, password },
      envelope: true,
    });
    return mapAuth(data, email);
  },
  async cart(customerId: string, assetBaseUrl?: string): Promise<CartSnapshot> {
    const data = await apiRequest('/api/v1/website/cart', { query: { customerId } });
    const items = asArray(data?.items || data?.lines).map((item) => mapCartLine(item, assetBaseUrl));
    const subtotal = pickNumber(
      data?.subtotal,
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    );
    const discount = pickNumber(data?.discount, data?.promotionDiscount);
    const delivery = pickNumber(data?.deliveryCharges, data?.shipping);
    return {
      items,
      subtotal,
      discount,
      delivery,
      total: pickNumber(data?.total, subtotal - discount + delivery),
      raw: data,
    };
  },
  async openCartSession(body: {
    email: string;
    name?: string;
    phone?: string;
    items?: CartLine[];
  }) {
    const data = await apiRequest('/api/v1/website/cart/session', {
      method: 'POST',
      body: {
        email: body.email,
        name: body.name,
        phone: body.phone,
        items: (body.items || []).map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          options: item.options,
          engraving: item.engraving,
        })),
      },
    });
    return { user: mapAuth({ data, ...data }, body.email), raw: data };
  },
  contact(body: { name: string; email: string; phone?: string; message: string }) {
    return apiRequest('/api/v1/website/contact', { method: 'POST', body });
  },
  addCartItem(body: Record<string, unknown>) {
    return apiRequest('/api/v1/website/cart/items', { method: 'POST', body });
  },
  setCartQty(body: { customerId: string; lineKey: string; quantity: number }) {
    return apiRequest('/api/v1/website/cart/items', { method: 'PATCH', body });
  },
  removeCartItem(customerId: string, lineKey: string) {
    return apiRequest('/api/v1/website/cart/items', {
      method: 'DELETE',
      query: { customerId, lineKey },
    });
  },
  replaceCart(customerId: string, items: CartLine[]) {
    return apiRequest('/api/v1/website/cart', {
      method: 'PUT',
      body: {
        customerId,
        items: items.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          options: item.options,
          engraving: item.engraving,
        })),
      },
    });
  },
  clearCart(customerId: string) {
    return apiRequest('/api/v1/website/cart', { method: 'DELETE', query: { customerId } });
  },
  async evaluatePromotions(input: {
    lines: { slug: string; quantity: number; unitPrice: number }[];
    couponCode?: string;
    customerId?: string;
  }): Promise<PromotionEval> {
    const data = await apiRequest('/api/v1/website/promotions/evaluate', {
      method: 'POST',
      body: {
        lines: input.lines,
        ...(input.couponCode?.trim() ? { couponCode: input.couponCode.trim() } : {}),
        ...(input.customerId ? { customerId: input.customerId } : {}),
      },
    });
    return mapPromo(data);
  },
  async placeOrder(body: Record<string, unknown>) {
    const data = await apiRequest('/api/v1/website/orders', { method: 'POST', body });
    return mapOrder(data);
  },
  async orders(customerId: string, token?: string, assetBaseUrl?: string) {
    const session = (token || '').trim();
    if (!session || session === customerId) return [];
    const data = await apiRequest('/api/v1/website/orders', {
      query: { customerId, token: session },
      accessToken: session,
    });
    return asArray(data).map((item) => mapOrder(item, assetBaseUrl));
  },
  async order(id: string, customerId: string, token?: string, assetBaseUrl?: string) {
    const session = (token || '').trim();
    if (!session || session === customerId) {
      throw new Error('Sign in to continue');
    }
    const data = await apiRequest(`/api/v1/website/orders/${encodeURIComponent(id)}`, {
      query: { customerId, token: session },
      accessToken: session,
    });
    return mapOrder(data, assetBaseUrl);
  },
};

export { DEFAULT_THEME, mapAuth };
